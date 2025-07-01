import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Tooltip,
  InputAdornment,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Container,
  Paper,
} from '@mui/material';
import {
  Build as BuildIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Recommend as RecommendIcon,
  PictureAsPdf as PdfIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
interface WPSData {
  materialType: string;
  materialGroup: string;
  thickness: number;
  jointType: string;
  process: string;
  position: string;
  wireSize: number;
  current: number;
  voltage: number;
  gasFlow: number;
  gasComposition: string;
  wireSpeed: number;
  travelSpeed: number;
  heatInput: number;
  preheatTemp: number;
  grooveType: string;
  grooveAngle: number;
  rootOpening: number;
  passCount: number;
  passes: PassData[];
}

interface PassData {
  passNumber: number;
  passType: 'root' | 'fill' | 'cap';
  current: number;
  voltage: number;
  wireSpeed: number;
  travelSpeed: number;
}

interface Recommendation {
  parameter: string;
  value: number | string;
  min: number;
  max: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

// Constants
const MATERIAL_TYPES = [
  'Çelik (Karbon)',
  'Çelik (Düşük Alaşımlı)', 
  'Paslanmaz Çelik',
  'Alüminyum',
];

const MATERIAL_GROUPS = {
  'Çelik (Karbon)': [
    'S235JR', 'S235J0', 'S235J2', 'S275JR', 'S275J0', 'S275J2',
    'S355JR', 'S355J0', 'S355J2', 'S355K2', 'S420NL', 'S460NL',
    'C22', 'C35', 'C45', 'C60', 'Ck15', 'Ck35', 'Ck45'
  ],
  'Çelik (Düşük Alaşımlı)': [
    'P235GH', 'P265GH', 'P295GH', 'P355GH', 'P460NL1', 'P460NL2',
    '16Mo3', '13CrMo4-5', '10CrMo9-10', '25CrMo4', '42CrMo4',
    'X20CrMoV11-1', 'X10CrMoVNb9-1', 'T/P11', 'T/P22', 'T/P91'
  ],
  'Paslanmaz Çelik': [
    'AISI 304 (X5CrNi18-10)', 'AISI 316 (X5CrNiMo17-12-2)', 
    'AISI 321 (X6CrNiTi18-10)', 'AISI 347 (X6CrNiNb18-10)',
    'AISI 310 (X15CrNi25-20)', 'AISI 904L', 'AISI 2205 (Duplex)',
    'AISI 2507 (Super Duplex)', 'Inconel 625', 'Hastelloy C276'
  ],
  'Alüminyum': [
    'Al 99.5 (1050)', 'Al 99.0 (1100)', 'AlMn1 (3003)', 'AlMn1Mg1 (3004)',
    'AlMg1 (5005)', 'AlMg2 (5251)', 'AlMg3 (5754)', 'AlMg4.5Mn (5083)',
    'AlMg5 (5086)', 'AlSi1MgMn (6082)', 'AlZnMgCu1.5 (7075)',
    'AlMgSi1 (6061)', 'AlMgSi0.5 (6060)'
  ],
};

// Joint Types
const JOINT_TYPES = [
  { 
    code: 'BUTT', 
    name: 'Alın Birleştirme (Butt Joint)', 
    description: 'İki parçanın uç uca getirilip kaynaklanması',
    icon: '|─|',
    applications: ['Levha birleştirme', 'Boru uç birleştirme', 'Profil birleştirme']
  },
  { 
    code: 'FILLET', 
    name: 'Köşe Birleştirme (Fillet Joint)', 
    description: 'İki parçanın 90° açıyla birleştirilmesi',
    icon: '└─',
    applications: ['T-birleştirme', 'L-birleştirme', 'Köşe kaynağı']
  },
  { 
    code: 'LAP', 
    name: 'Bindirme Birleştirme (Lap Joint)', 
    description: 'İki parçanın üst üste bindirilerek kaynaklanması',
    icon: '┌─┐',
    applications: ['Levha bindirme', 'Tamir kaynakları']
  }
];

const WELDING_PROCESSES = [
  { code: 'MIG/MAG', name: 'MIG/MAG Kaynağı' },
  { code: 'TIG', name: 'TIG Kaynağı' },
  { code: 'MMA', name: 'El Arkı Kaynağı' },
];

const POSITION_GROUPS = {
  'Temel Pozisyonlar (EN ISO 6947)': [
    { code: 'PA', name: 'PA (Düz/Yatay) - En Kolay Pozisyon' },
    { code: 'PB', name: 'PB (Yatay/Düşey) - Yukarı Doğru' },
    { code: 'PC', name: 'PC (Yatay/Yarı) - Aşağı Doğru' },
    { code: 'PD', name: 'PD (Yatay/Tavan) - Tepegöz' },
  ],
  'Gelişmiş Pozisyonlar (EN ISO 6947)': [
    { code: 'PE', name: 'PE (Tavan) - Levha veya Boru Üst' },
    { code: 'PF', name: 'PF (Dik Yukarı) - Dikey Yukarı Doğru' },
    { code: 'PG', name: 'PG (Dik Aşağı) - Dikey Aşağı Doğru' },
    { code: 'PH', name: 'PH (Yatay/Tavan) - Levha veya Boru Tavan' },
    { code: 'PJ', name: 'PJ (Eğimli Yukarı) - 45° Yukarı Eğimli' },
    { code: 'PK', name: 'PK (Eğimli Aşağı) - 45° Aşağı Eğimli' },
  ],
  'Amerikan Standartları (ASME/AWS)': [
    { code: '1G', name: '1G (Yatay Düz) - Levha Yatay' },
    { code: '2G', name: '2G (Yatay Dikey) - Levha Dikey' },
    { code: '3G', name: '3G (Dikey) - Levha Dikey Kaynak' },
    { code: '4G', name: '4G (Tavan) - Levha Tavan Kaynak' },
    { code: '5G', name: '5G (Boru Yatay Sabit) - Boru Sabit' },
    { code: '6G', name: '6G (Boru Eğimli 45°) - Boru Eğimli' },
  ],
};

const WIRE_SIZES = {
  'MIG/MAG': [0.8, 1.0, 1.2, 1.6, 2.0],
  'TIG': [1.6, 2.0, 2.4, 3.2],
  'MMA': [2.5, 3.2, 4.0, 5.0],
};

const GAS_COMPOSITIONS = {
  'MIG/MAG': [
    'M21 (Ar + 15-25% CO2)',
    'M12 (Ar + 2-5% CO2)',
    'M13 (Ar + 5-15% CO2 + 0.5-3% O2)',
    'I1 (100% Ar)',
    'I2 (Ar + max 5% H2)',
    'M11 (Ar + 0.5-3% CO2)',
    'M22 (Ar + 20-25% CO2)',
    'M23 (Ar + 25-30% CO2)',
    'M24 (Ar + 15-25% CO2 + 3-5% O2)',
    'C1 (100% CO2)',
  ],
  'TIG': [
    'I1 (100% Ar)',
    'I2 (Ar + max 5% H2)',
    'I3 (100% He)',
    'I4 (Ar + He karışımı)',
    'R1 (Ar + N2)',
  ],
  'MMA': [],
};

interface GrooveType {
  code: string;
  name: string;
  minThickness: number;
  maxThickness: number;
  recommendedAngle: number;
  description: string;
  jointTypes: string[];
}

const GROOVE_TYPES: GrooveType[] = [
  { 
    code: 'I', 
    name: 'I Kaynak Ağzı (İnce)', 
    minThickness: 1, 
    maxThickness: 6, 
    recommendedAngle: 0, 
    description: 'Düz kenar birleştirme, ince malzemeler için ideal',
    jointTypes: ['BUTT']
  },
  { 
    code: 'I_HEAVY', 
    name: 'I Kaynak Ağzı (Kalın)', 
    minThickness: 7, 
    maxThickness: 20, 
    recommendedAngle: 0, 
    description: 'Kalın malzemeler için I ağzı, özel nüfuziyet kontrolü gerekir',
    jointTypes: ['BUTT']
  },
  { 
    code: 'SQUARE', 
    name: 'Düz Ağız (Square)', 
    minThickness: 1, 
    maxThickness: 6, 
    recommendedAngle: 0, 
    description: 'Hazırlıksız kenar, çok ince malzemeler',
    jointTypes: ['BUTT', 'LAP']
  },
  { 
    code: 'V', 
    name: 'V Ağzı', 
    minThickness: 3, 
    maxThickness: 50, 
    recommendedAngle: 60, 
    description: 'Standart V şekilli hazırlık, orta kalınlık malzemeler',
    jointTypes: ['BUTT']
  },
  { 
    code: 'U', 
    name: 'U Ağzı', 
    minThickness: 10, 
    maxThickness: 100, 
    recommendedAngle: 20, 
    description: 'U şekilli hazırlık, kalın malzemeler için ekonomik',
    jointTypes: ['BUTT']
  },
  { 
    code: 'X', 
    name: 'X Ağzı (Çift V Simetrik)', 
    minThickness: 12, 
    maxThickness: 200, 
    recommendedAngle: 60, 
    description: 'Çift taraflı simetrik V hazırlık, yüksek mukavemet gereken yerler',
    jointTypes: ['BUTT']
  },
  { 
    code: 'K', 
    name: 'K Ağzı (Asimetrik Çift V)', 
    minThickness: 15, 
    maxThickness: 150, 
    recommendedAngle: 45, 
    description: 'Çift taraflı asimetrik V, farklı açılarla kalın malzemeler',
    jointTypes: ['BUTT']
  },
  { 
    code: 'Y', 
    name: 'Y Ağzı (Tek Taraflı Pah)', 
    minThickness: 6, 
    maxThickness: 40, 
    recommendedAngle: 50, 
    description: 'Tek taraflı açılı hazırlık, erişim kısıtlı alanlar',
    jointTypes: ['BUTT']
  },
  { 
    code: 'DOUBLE_V', 
    name: 'Çift V Ağzı (Standart)', 
    minThickness: 15, 
    maxThickness: 200, 
    recommendedAngle: 60, 
    description: 'Çift taraflı V hazırlık, çok kalın malzemeler',
    jointTypes: ['BUTT']
  },
  { 
    code: 'DOUBLE_U', 
    name: 'Çift U Ağzı', 
    minThickness: 25, 
    maxThickness: 300, 
    recommendedAngle: 20, 
    description: 'Çift taraflı U hazırlık, en kalın malzemeler için',
    jointTypes: ['BUTT']
  },
  { 
    code: 'J', 
    name: 'J Ağzı', 
    minThickness: 8, 
    maxThickness: 60, 
    recommendedAngle: 30, 
    description: 'J şekilli hazırlık, özel uygulamalar ve boru birleştirme',
    jointTypes: ['BUTT', 'CORNER']
  },
  { 
    code: 'FLARE_V', 
    name: 'Kavisli V Ağzı', 
    minThickness: 3, 
    maxThickness: 25, 
    recommendedAngle: 90, 
    description: 'Boru ve profil birleştirmeler için kavisli hazırlık',
    jointTypes: ['BUTT']
  },
  { 
    code: 'HV', 
    name: 'Yarım V Ağzı', 
    minThickness: 4, 
    maxThickness: 20, 
    recommendedAngle: 45, 
    description: 'Kısmi V hazırlık, orta kalınlık malzemeler için ekonomik',
    jointTypes: ['BUTT']
  },
  { 
    code: 'HU', 
    name: 'Yarım U Ağzı', 
    minThickness: 8, 
    maxThickness: 35, 
    recommendedAngle: 15, 
    description: 'Kısmi U hazırlık, kalın malzemeler için ekonomik seçenek',
    jointTypes: ['BUTT']
  },
  { 
    code: 'BEVEL', 
    name: 'Pah Ağzı (Bevel)', 
    minThickness: 2, 
    maxThickness: 25, 
    recommendedAngle: 45, 
    description: 'Tek taraflı pah, T-birleştirmelerde kullanılır',
    jointTypes: ['FILLET', 'LAP']
  },
  { 
    code: 'FILLET', 
    name: 'Köşe Kaynağı (Fillet)', 
    minThickness: 2, 
    maxThickness: 50, 
    recommendedAngle: 90, 
    description: 'L ve T şeklinde birleştirmeler için',
    jointTypes: ['FILLET']
  },
  { 
    code: 'PARTIAL_PENETRATION', 
    name: 'Kısmi Nüfuziyetli Köşe Kaynak', 
    minThickness: 3, 
    maxThickness: 25, 
    recommendedAngle: 45, 
    description: 'Köşe birleştirmelerde daha güçlü bağlantı için',
    jointTypes: ['FILLET']
  }
];

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.35)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&::before': {
    content: '""',
    width: '4px',
    height: '24px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

const RecommendationCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
  border: `1px solid ${theme.palette.primary.main}30`,
  borderRadius: 12,
  position: 'sticky',
  top: theme.spacing(2),
}));

const MainContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1400px !important',
  padding: theme.spacing(3),
}));

// Doğru MIG/MAG parametrelerini hesaplayan fonksiyon
const getMigParameters = (thickness: number, wireSize: number): {
  current: number;
  voltage: number;
  minCurrent: number;
  maxCurrent: number;
  minVoltage: number;
  maxVoltage: number;
} => {
  // Profesyonel MIG/MAG kaynak parametreleri tablosu (Kullanıcı tablosu)
  const migTable = [
    // [kalınlık_min, kalınlık_max, tel_çapı, voltaj_min, voltaj_max, amper_min, amper_max]
    // 0.5mm kalınlık
    [0.4, 0.6, 0.6, 15, 17, 20, 30],
    
    // 1.0mm kalınlık
    [0.8, 1.2, 0.6, 16, 18, 30, 40],
    [0.8, 1.2, 0.8, 16, 18, 30, 40],
    
    // 1.5mm kalınlık
    [1.3, 1.7, 0.6, 17, 19, 35, 50],
    [1.3, 1.7, 0.8, 17, 19, 35, 50],
    
    // 2.0mm kalınlık
    [1.8, 2.2, 0.8, 18, 20, 40, 90],
    [1.8, 2.2, 1.0, 18, 20, 40, 90],
    
    // 2.5mm kalınlık
    [2.3, 2.7, 0.8, 19, 21, 50, 100],
    [2.3, 2.7, 1.0, 19, 21, 50, 100],
    
    // 3.0mm kalınlık
    [2.8, 3.2, 0.8, 20, 22, 90, 120],
    [2.8, 3.2, 1.0, 20, 22, 90, 120],
    [2.8, 3.2, 1.2, 20, 22, 90, 120],
    
    // 3.5mm kalınlık
    [3.3, 3.7, 0.8, 21, 23, 100, 130],
    [3.3, 3.7, 1.0, 21, 23, 100, 130],
    [3.3, 3.7, 1.2, 21, 23, 100, 130],
    
    // 4.0mm kalınlık
    [3.8, 4.2, 0.8, 22, 24, 120, 150],
    [3.8, 4.2, 1.0, 22, 24, 120, 150],
    [3.8, 4.2, 1.2, 22, 24, 120, 150],
    
    // 4.5mm kalınlık
    [4.3, 4.7, 0.8, 23, 25, 140, 170],
    [4.3, 4.7, 1.0, 23, 25, 140, 170],
    [4.3, 4.7, 1.2, 23, 25, 140, 170],
    
    // 5.0mm kalınlık
    [4.8, 5.2, 0.8, 24, 26, 150, 180],
    [4.8, 5.2, 1.0, 24, 26, 150, 180],
    [4.8, 5.2, 1.2, 24, 26, 150, 180],
    
    // 5.5mm kalınlık
    [5.3, 5.7, 0.8, 25, 27, 160, 190],
    [5.3, 5.7, 1.0, 25, 27, 160, 190],
    [5.3, 5.7, 1.2, 25, 27, 160, 190],
    
    // 6.0mm kalınlık
    [5.8, 6.2, 0.8, 26, 28, 180, 210],
    [5.8, 6.2, 1.0, 26, 28, 180, 210],
    [5.8, 6.2, 1.2, 26, 28, 180, 210],
    
    // Kalın malzemeler için ek değerler
    [6.5, 7.5, 1.0, 27, 29, 210, 250],
    [6.5, 7.5, 1.2, 27, 29, 210, 250],
    [6.5, 7.5, 1.6, 27, 29, 210, 250],
    [7.5, 8.5, 1.0, 28, 30, 220, 270],
    [7.5, 8.5, 1.2, 28, 30, 220, 270],
    [7.5, 8.5, 1.6, 28, 30, 220, 270],
    [8.5, 9.5, 1.2, 29, 31, 240, 300],
    [8.5, 9.5, 1.6, 29, 31, 240, 300],
    [9.5, 10.5, 1.2, 30, 32, 250, 320],
    [9.5, 10.5, 1.6, 30, 32, 250, 320],
    [10.5, 12.5, 1.2, 31, 33, 280, 350],
    [10.5, 12.5, 1.6, 31, 33, 280, 350],
    [12.5, 15.5, 1.6, 32, 34, 320, 400],
    [12.5, 15.5, 2.0, 32, 34, 320, 400],
    [15.5, 20.5, 1.6, 33, 36, 400, 500],
    [15.5, 20.5, 2.0, 33, 36, 400, 500],
    [20.5, 25.5, 2.0, 35, 38, 500, 600],
    [25.5, 30.5, 2.0, 37, 40, 600, 700],
    [30.5, 40.5, 2.0, 39, 42, 700, 800]
  ];

  // En uygun parametreyi bul
  let bestMatch = null;
  let bestScore = Infinity;

  for (const params of migTable) {
    const [minThick, maxThick, wireD, minV, maxV, minA, maxA] = params;
    
    // Kalınlık ve tel çapı kontrolü
    if (thickness >= minThick && thickness <= maxThick && Math.abs(wireSize - wireD) < 0.1) {
      const thickScore = Math.abs(thickness - (minThick + maxThick) / 2);
      const wireScore = Math.abs(wireSize - wireD);
      const totalScore = thickScore + wireScore * 10;
      
      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestMatch = params;
      }
    }
  }

  if (bestMatch) {
    const [, , , minV, maxV, minA, maxA] = bestMatch;
    return {
      current: (minA + maxA) / 2, // Ortalama amper
      voltage: (minV + maxV) / 2, // Ortalama voltaj
      minCurrent: minA,
      maxCurrent: maxA,
      minVoltage: minV,
      maxVoltage: maxV
    };
  }

  // Eğer tablo'da bulunamadıysa genel hesaplama
  let current = 50;
  let voltage = 15;

  if (thickness <= 1) {
    current = 30 + thickness * 20;
    voltage = 15 + thickness * 2;
  } else if (thickness <= 3) {
    current = 50 + thickness * 30;
    voltage = 17 + thickness * 1.5;
  } else if (thickness <= 6) {
    current = 120 + thickness * 15;
    voltage = 20 + thickness * 1;
  } else if (thickness <= 12) {
    current = 200 + thickness * 20;
    voltage = 24 + thickness * 0.5;
  } else if (thickness <= 20) {
    current = 350 + thickness * 15;
    voltage = 28 + thickness * 0.3;
  } else {
    current = 500 + thickness * 10;
    voltage = 32 + thickness * 0.2;
  }

  return {
    current: Math.round(current),
    voltage: Math.round(voltage * 10) / 10,
    minCurrent: Math.round(current * 0.8),
    maxCurrent: Math.round(current * 1.2),
    minVoltage: Math.round((voltage - 1) * 10) / 10,
    maxVoltage: Math.round((voltage + 1) * 10) / 10
  };
};

// Smart Pass Calculation Engine
const calculatePassData = (wpsData: Partial<WPSData>): PassData[] => {
  if (!wpsData.thickness || !wpsData.wireSize || !wpsData.process) {
    return [];
  }

  const passes: PassData[] = [];
  const thickness = wpsData.thickness;
  const wireSize = wpsData.wireSize;
  const grooveAngle = wpsData.grooveAngle || 60; // Varsayılan açı
  
  let passCount = 1;
  
  // Kaynak ağzı türüne göre temel hesaplama
  if (wpsData.grooveType === 'I') {
    if (thickness <= 3) {
      passCount = 1;
    } else if (thickness <= 6) {
      passCount = 2;
    } else {
      passCount = 3;
    }
  } else if (wpsData.grooveType === 'I_HEAVY') {
    if (thickness <= 10) {
      passCount = 2;
    } else if (thickness <= 14) {
      passCount = 3;
    } else if (thickness <= 18) {
      passCount = 4;
    } else {
      passCount = Math.ceil(thickness / 4) + 1;
    }
  } else if (wpsData.grooveType === 'SQUARE') {
    // Düz ağız için minimum paso
    passCount = Math.max(1, Math.ceil(thickness / 6));
  } else if (wpsData.grooveType === 'V') {
    // V ağzı için açıya göre hesaplama
    const volumeFactor = grooveAngle / 60; // 60° referans alınıyor
    passCount = Math.ceil((thickness * volumeFactor) / 4);
    passCount = Math.max(2, passCount);
  } else if (wpsData.grooveType === 'U') {
    // U ağzı daha az paso gerektirir
    passCount = Math.ceil(thickness / 6) + 1;
    passCount = Math.max(2, passCount);
  } else if (wpsData.grooveType === 'X') {
    // Çift taraflı kaynak
    passCount = Math.ceil(thickness / 6) * 2;
    passCount = Math.max(4, passCount);
  } else if (wpsData.grooveType === 'K') {
    // Asimetrik çift V
    passCount = Math.ceil(thickness / 5) + 2;
    passCount = Math.max(5, passCount);
  } else if (wpsData.grooveType === 'Y') {
    // Tek taraflı pah
    passCount = Math.ceil(thickness / 8) + 1;
    passCount = Math.max(2, passCount);
  } else if (wpsData.grooveType === 'DOUBLE_V') {
    // Çift V standart
    passCount = Math.ceil(thickness / 5) * 2;
    passCount = Math.max(4, passCount);
  } else if (wpsData.grooveType === 'DOUBLE_U') {
    // Çift U
    passCount = Math.ceil(thickness / 8) * 2;
    passCount = Math.max(4, passCount);
  } else if (wpsData.grooveType === 'FILLET') {
    // Köşe kaynağı
    const legLength = Math.min(thickness * 0.7, 12); // Bacak uzunluğu
    passCount = Math.ceil(legLength / 4);
    passCount = Math.max(1, passCount);
  } else {
    // Genel hesaplama
    if (thickness <= 3) {
      passCount = 1;
    } else if (thickness <= 6) {
      passCount = 2;
    } else if (thickness <= 12) {
      passCount = 3;
    } else if (thickness <= 20) {
      passCount = Math.ceil(thickness / 5);
    } else {
      passCount = Math.ceil(thickness / 4);
    }
  }

  // Tel çapına göre düzeltme
  if (wireSize <= 1.0 && thickness > 6) {
    passCount += Math.ceil(thickness / 10); // İnce tel daha fazla paso
  } else if (wireSize <= 1.2 && thickness > 10) {
    passCount += 1;
  } else if (wireSize >= 2.0 && thickness > 8) {
    passCount = Math.max(1, passCount - 1); // Kalın tel daha az paso
  }

  // Ağız açısının etkisi (V, K, Y gibi açılı ağızlar için)
  if (['V', 'K', 'Y', 'DOUBLE_V', 'BEVEL'].includes(wpsData.grooveType || '')) {
    if (grooveAngle > 80) {
      passCount += 1; // Geniş açı daha fazla paso
    } else if (grooveAngle < 40) {
      passCount = Math.max(1, passCount - 1); // Dar açı daha az paso
    }
  }

  // Paso türlerini akıllıca belirle
  let rootPassCount = 1;
  let capPassCount = 1;
  
  // Kalınlığa göre kök ve kapak paso sayılarını hesapla
  if (thickness <= 3) {
    rootPassCount = 1;
    capPassCount = 1;
  } else if (thickness <= 6) {
    rootPassCount = 1; 
    capPassCount = 1;
  } else if (thickness <= 10) {
    rootPassCount = 1;
    capPassCount = 2; // Kalın malzemede 2 kapak pasosu
  } else if (thickness <= 15) {
    rootPassCount = 2; // Kök + hot pass
    capPassCount = 2;
  } else if (thickness <= 25) {
    rootPassCount = 2;
    capPassCount = 3; // 3 kapak pasosu
  } else if (thickness <= 40) {
    rootPassCount = 2;
    capPassCount = 3;
  } else {
    rootPassCount = 3; // Çok kalın malzemede 3 kök pasosu
    capPassCount = 4; // 4 kapak pasosu
  }

  // Kaynak ağzı türüne göre ayarlamalar
  if (wpsData.grooveType === 'X' || wpsData.grooveType === 'DOUBLE_V' || wpsData.grooveType === 'DOUBLE_U') {
    // Çift taraflı kaynaklarda her tarafta kök ve kapak gerekir
    rootPassCount = Math.max(2, rootPassCount);
    capPassCount = Math.max(2, capPassCount);
  } else if (wpsData.grooveType === 'U' || wpsData.grooveType === 'J') {
    // U ve J ağızlarında daha az paso gerekebilir
    capPassCount = Math.max(1, capPassCount - 1);
  }

  // Toplam paso sayısından daha fazla kök+kapak olamaz
  if (rootPassCount + capPassCount > passCount) {
    if (passCount <= 2) {
      rootPassCount = 1;
      capPassCount = 1;
    } else if (passCount <= 4) {
      rootPassCount = 1;
      capPassCount = 2;
    } else {
      // Oransal azaltma
      const totalSpecial = rootPassCount + capPassCount;
      rootPassCount = Math.max(1, Math.floor((rootPassCount / totalSpecial) * (passCount - 1)));
      capPassCount = Math.max(1, Math.floor((capPassCount / totalSpecial) * (passCount - 1)));
    }
  }

  for (let i = 1; i <= passCount; i++) {
    let passType: 'root' | 'fill' | 'cap';
    let currentFactor = 1;
    let voltageFactor = 1;
    
    if (i <= rootPassCount) {
      passType = 'root';
      currentFactor = 0.7 + (i - 1) * 0.1; // İlk kök düşük, sonrakiler artar
      voltageFactor = 0.9;
    } else if (i > passCount - capPassCount) {
      passType = 'cap';
      currentFactor = 0.85;
      voltageFactor = 1.1;
    } else {
      passType = 'fill';
      currentFactor = 1.0;
      voltageFactor = 1.0;
    }

    let baseCurrent = 0;
    let baseVoltage = 0;

    if (wpsData.process === 'MIG/MAG') {
      // Doğru MIG/MAG parametreleri - profesyonel tablolara göre
      const migParams = getMigParameters(thickness, wireSize);
      baseCurrent = migParams.current;
      baseVoltage = migParams.voltage;
    } else if (wpsData.process === 'TIG') {
      baseCurrent = wireSize * 80 + thickness * 15;
      baseVoltage = 14 + wireSize * 2;
    } else if (wpsData.process === 'MMA') {
      baseCurrent = wireSize * 50 + thickness * 15;
      baseVoltage = 14 + wireSize * 2;
    }

    const current = Math.round(baseCurrent * currentFactor);
    const voltage = Math.round(baseVoltage * voltageFactor * 10) / 10;
    
    let wireSpeed = 0;
    if (wpsData.process === 'MIG/MAG') {
      const wireArea = Math.PI * Math.pow(wireSize / 2, 2);
      wireSpeed = (current * 60) / (wireArea * 7.8 * 120);
      if (passType === 'root') wireSpeed *= 0.8;
      if (passType === 'cap') wireSpeed *= 0.9;
    }

    let travelSpeed = 0;
    if (wpsData.process === 'MIG/MAG') {
      travelSpeed = 400 - (thickness * 25);
      if (passType === 'root') travelSpeed *= 0.6;
      if (passType === 'cap') travelSpeed *= 0.8;
    } else if (wpsData.process === 'TIG') {
      travelSpeed = 200 - (thickness * 15);
      if (passType === 'root') travelSpeed *= 0.5;
      if (passType === 'cap') travelSpeed *= 0.7;
    }

    passes.push({
      passNumber: i,
      passType,
      current: Math.max(50, current),
      voltage: Math.max(10, voltage),
      wireSpeed: Math.round(wireSpeed * 10) / 10,
      travelSpeed: Math.round(travelSpeed)
    });
  }

  return passes;
};

// Smart Recommendation Engine
const calculateRecommendations = (wpsData: Partial<WPSData>): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // 1. Kaynak Yöntemi Önerisi (Malzeme türüne göre)
  if (wpsData.materialType && !wpsData.process) {
    let suggestedProcess = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let reason = '';

    if (wpsData.materialType.includes('Alüminyum')) {
      suggestedProcess = 'TIG';
      confidence = 'high';
      reason = 'Alüminyum için en uygun yöntem - temiz kaynak, distorsiyon kontrolü';
    } else if (wpsData.materialType.includes('Paslanmaz')) {
      suggestedProcess = 'TIG';
      confidence = 'high';
      reason = 'Paslanmaz çelik için ideal - oksitlenme yok, kaliteli kaynak';
    } else if (wpsData.materialType.includes('Çelik')) {
      if (wpsData.thickness && wpsData.thickness > 6) {
        suggestedProcess = 'MIG/MAG';
        confidence = 'high';
        reason = 'Kalın çelik için verimli - yüksek depolama hızı';
      } else {
        suggestedProcess = 'MIG/MAG';
        confidence = 'medium';
        reason = 'Çelik için çok amaçlı yöntem - hızlı ve ekonomik';
      }
    }

    if (suggestedProcess) {
      recommendations.push({
        parameter: 'process',
        value: suggestedProcess,
        min: 0,
        max: 0,
        reason: reason,
        confidence: confidence
      });
    }
  }

  // 2. Kaynak Pozisyonu Önerisi (Birleştirme tipine göre)
  if (wpsData.jointType && !wpsData.position) {
    let suggestedPosition = '';
    let reason = '';
    
    if (wpsData.jointType === 'BUTT') {
      suggestedPosition = 'PA';
      reason = 'Alın birleştirme için en uygun - kolay erişim, kaliteli kaynak';
    } else if (wpsData.jointType === 'FILLET') {
      suggestedPosition = 'PB';
      reason = 'Köşe birleştirme için ideal - yerçekimi avantajı';
    } else if (wpsData.jointType === 'LAP') {
      suggestedPosition = 'PA';
      reason = 'Bindirme birleştirme için en uygun pozisyon';
    }

    if (suggestedPosition) {
      recommendations.push({
        parameter: 'position',
        value: suggestedPosition,
        min: 0,
        max: 0,
        reason: reason,
        confidence: 'high'
      });
    }
  }

  // 3. Tel/Elektrod Çapı Önerisi (Kalınlık ve yönteme göre)
  if (wpsData.thickness && wpsData.process && !wpsData.wireSize) {
    let suggestedWireSize = 0;
    let reason = '';

    if (wpsData.process === 'MIG/MAG') {
      if (wpsData.thickness <= 3) {
        suggestedWireSize = 0.8;
        reason = 'İnce malzeme için - az ısı girdisi, distorsiyon kontrolü';
      } else if (wpsData.thickness <= 6) {
        suggestedWireSize = 1.0;
        reason = 'Orta kalınlık için optimum - verimlilik ve kalite dengesi';
      } else if (wpsData.thickness <= 12) {
        suggestedWireSize = 1.2;
        reason = 'Kalın malzeme için - yüksek depolama hızı';
      } else {
        suggestedWireSize = 1.6;
        reason = 'Çok kalın malzeme için - maksimum verimlilik';
      }
    } else if (wpsData.process === 'TIG') {
      if (wpsData.thickness <= 3) {
        suggestedWireSize = 1.6;
        reason = 'İnce malzeme TIG kaynağı için ideal çap';
      } else if (wpsData.thickness <= 8) {
        suggestedWireSize = 2.0;
        reason = 'Orta kalınlık TIG için standart çap';
      } else {
        suggestedWireSize = 2.4;
        reason = 'Kalın TIG kaynağı için - daha iyi akım taşıma';
      }
    } else if (wpsData.process === 'MMA') {
      if (wpsData.thickness <= 4) {
        suggestedWireSize = 2.5;
        reason = 'İnce elektrod kaynağı için minimum çap';
      } else if (wpsData.thickness <= 8) {
        suggestedWireSize = 3.2;
        reason = 'Standart elektrod çapı - en yaygın kullanım';
      } else {
        suggestedWireSize = 4.0;
        reason = 'Kalın malzeme için - yüksek akım kapasitesi';
      }
    }

    if (suggestedWireSize > 0) {
      recommendations.push({
        parameter: 'wireSize',
        value: suggestedWireSize,
        min: 0,
        max: 0,
        reason: reason,
        confidence: 'high'
      });
    }
  }

  // 4. Kaynak Ağzı Türü Önerisi (Kalınlık ve birleştirme tipine göre)
  if (wpsData.thickness && wpsData.jointType && !wpsData.grooveType) {
    let suggestedGrooveType = '';
    let reason = '';

    if (wpsData.jointType === 'FILLET') {
      suggestedGrooveType = 'FILLET';
      reason = 'Köşe birleştirme için standart ağız türü';
    } else if (wpsData.jointType === 'BUTT') {
      if (wpsData.thickness <= 3) {
        suggestedGrooveType = 'I';
        reason = 'İnce malzeme için - hazırlıksız, ekonomik';
      } else if (wpsData.thickness <= 6) {
        suggestedGrooveType = 'I';
        reason = 'Orta ince malzeme için - minimal hazırlık';
      } else if (wpsData.thickness <= 12) {
        suggestedGrooveType = 'V';
        reason = 'Orta kalınlık için ideal - tam nüfuziyet garantisi';
      } else if (wpsData.thickness <= 25) {
        suggestedGrooveType = 'V';
        reason = 'Kalın malzeme için - ekonomik ve güvenilir';
      } else {
        suggestedGrooveType = 'X';
        reason = 'Çok kalın malzeme için - simetrik ısı dağılımı';
      }
    } else if (wpsData.jointType === 'LAP') {
      suggestedGrooveType = 'SQUARE';
      reason = 'Bindirme birleştirme için - hazırlıksız ağız';
    }

    if (suggestedGrooveType) {
      recommendations.push({
        parameter: 'grooveType',
        value: suggestedGrooveType,
        min: 0,
        max: 0,
        reason: reason,
        confidence: 'high'
      });
    }
  }

  // 5. Gaz Bileşimi Önerisi (Temel malzeme ve yöntem kontrolü)
  if (wpsData.materialType && wpsData.process && !wpsData.gasComposition) {
    let suggestedGas = '';
    let reason = '';

    if (wpsData.process === 'MIG/MAG') {
      if (wpsData.materialType.includes('Alüminyum')) {
        suggestedGas = 'I1 (100% Ar)';
        reason = 'Alüminyum için - oksitlenme önler, temiz kaynak';
      } else if (wpsData.materialType.includes('Paslanmaz')) {
        suggestedGas = 'M12 (Ar + 0.5-5% CO2)';
        reason = 'Paslanmaz çelik için - düşük karbonlu karışım';
      } else if (wpsData.materialType.includes('Çelik')) {
        if (wpsData.thickness && wpsData.thickness <= 3) {
          suggestedGas = 'M12 (Ar + 2-5% CO2)';
          reason = 'İnce çelik için - düşük sıçrama, temiz kaynak';
        } else {
          suggestedGas = 'M21 (Ar + 15-25% CO2)';
          reason = 'Çelik için ekonomik - iyi nüfuziyet, yüksek verimlilik';
        }
      }
    } else if (wpsData.process === 'TIG') {
      suggestedGas = 'I1 (100% Ar)';
      reason = 'TIG kaynağı için standart - temiz ark, stabil kaynak';
    } else if (wpsData.process === 'MMA') {
      // MMA için gaz koruması yok, sadece bilgi amaçlı
      suggestedGas = 'Gaz koruması yok';
      reason = 'MMA kaynağında elektrod kaplamalar koruma sağlar';
    }

    if (suggestedGas && suggestedGas !== 'Gaz koruması yok') {
      recommendations.push({
        parameter: 'gasComposition',
        value: suggestedGas,
        min: 0,
        max: 0,
        reason: reason,
        confidence: 'high'
      });
    }
  }
  
  // Mevcut parametrik öneriler (akım, voltaj vb.)
  if (wpsData.wireSize && wpsData.thickness && wpsData.process && wpsData.position) {
    let current = 0;
    if (wpsData.process === 'MIG/MAG') {
      current = wpsData.wireSize * 100 + wpsData.thickness * 20;
    } else if (wpsData.process === 'TIG') {
      current = wpsData.wireSize * 80 + wpsData.thickness * 15;
    } else if (wpsData.process === 'MMA') {
      current = wpsData.wireSize * 35 + wpsData.thickness * 10;
    }

    let positionFactor = 1.0;
    switch (wpsData.position) {
      case 'PA': positionFactor = 1.0; break;
      case 'PB': positionFactor = 0.9; break;
      case 'PC': positionFactor = 0.85; break;
      case 'PD': positionFactor = 0.8; break;
      case 'PE': case 'PF': case 'PG': case 'PH': positionFactor = 0.88; break;
      case '2G': case '3G': positionFactor = 0.92; break;
      case '4G': case '6G': positionFactor = 0.82; break;
      default: positionFactor = 1.0;
    }
    
    current = current * positionFactor;

    recommendations.push({
      parameter: 'current',
      value: Math.round(current),
      min: Math.round(current * 0.8),
      max: Math.round(current * 1.2),
      reason: `${wpsData.wireSize}mm tel, ${wpsData.thickness}mm kalınlık için`,
      confidence: 'high'
    });

    let voltage = 0;
    if (wpsData.process === 'MIG/MAG') {
      voltage = 14 + (current - 100) * 0.02 + wpsData.wireSize * 2;
    } else if (wpsData.process === 'TIG') {
      voltage = 10 + (current - 50) * 0.015;
    } else if (wpsData.process === 'MMA') {
      voltage = 20 + (current - 80) * 0.025;
    }

    switch (wpsData.position) {
      case 'PB': case 'PC': voltage *= 1.05; break;
      case 'PD': voltage *= 1.1; break;
      case '4G': case '6G': voltage *= 1.08; break;
    }

    recommendations.push({
      parameter: 'voltage',
      value: Math.round(voltage * 10) / 10,
      min: Math.round(voltage * 0.9 * 10) / 10,
      max: Math.round(voltage * 1.1 * 10) / 10,
      reason: `${Math.round(current)}A akım için optimum voltaj`,
      confidence: 'high'
    });

    let gasFlow = 8 + wpsData.thickness * 0.5;
    if (['PB', 'PC', 'PD'].includes(wpsData.position)) gasFlow *= 1.2;

    recommendations.push({
      parameter: 'gasFlow',
      value: Math.round(gasFlow),
      min: Math.round(gasFlow * 0.8),
      max: Math.round(gasFlow * 1.4),
      reason: `${wpsData.thickness}mm kalınlık ve ${wpsData.position} pozisyonu için`,
      confidence: 'medium'
    });

    // Gaz bileşimi önerisi - sadece henüz seçilmemişse
    if (!wpsData.gasComposition) {
      let gasComp = '';
      if (wpsData.process === 'MIG/MAG') {
        if (wpsData.materialType?.includes('Çelik')) {
          gasComp = wpsData.thickness <= 3 ? 'M12 (Ar + 2-5% CO2)' : 'M21 (Ar + 15-25% CO2)';
        } else if (wpsData.materialType?.includes('Alüminyum')) {
          gasComp = 'I1 (100% Ar)';
        } else if (wpsData.materialType?.includes('Paslanmaz')) {
          gasComp = 'M12 (Ar + 0.5-5% CO2)';
        }
      } else if (wpsData.process === 'TIG') {
        gasComp = 'I1 (100% Ar)';
      }

      if (gasComp) {
        recommendations.push({
          parameter: 'gasComposition',
          value: gasComp,
          min: 0,
          max: 0,
          reason: `${wpsData.materialType} ve ${wpsData.process} için önerilen gaz`,
          confidence: 'high'
        });
      }
    }

    if (wpsData.process === 'MIG/MAG') {
      let wireSpeed = 0;
      const wireArea = Math.PI * Math.pow(wpsData.wireSize / 2, 2);
      wireSpeed = (current * 60) / (wireArea * 7.8 * 120);
      
      if (['PB', 'PC'].includes(wpsData.position)) wireSpeed *= 0.8;
      else if (wpsData.position === 'PD') wireSpeed *= 0.7;

      recommendations.push({
        parameter: 'wireSpeed',
        value: Math.round(wireSpeed * 10) / 10,
        min: Math.round(wireSpeed * 0.8 * 10) / 10,
        max: Math.round(wireSpeed * 1.2 * 10) / 10,
        reason: `${Math.round(current)}A akım ve ${wpsData.wireSize}mm tel için`,
        confidence: 'high'
      });
    }

    let travelSpeed = 0;
    if (wpsData.process === 'MIG/MAG') {
      travelSpeed = 400 - (wpsData.thickness * 25);
      if (wpsData.thickness > 10) travelSpeed = 150;
    } else if (wpsData.process === 'TIG') {
      travelSpeed = 200 - (wpsData.thickness * 15);
      if (wpsData.thickness > 8) travelSpeed = 80;
    } else if (wpsData.process === 'MMA') {
      travelSpeed = 250 - (wpsData.thickness * 20);
      if (wpsData.thickness > 6) travelSpeed = 100;
    }

    if (['PB', 'PC'].includes(wpsData.position)) travelSpeed *= 0.7;
    else if (wpsData.position === 'PD') travelSpeed *= 0.6;

    if (travelSpeed > 0) {
      recommendations.push({
        parameter: 'travelSpeed',
        value: Math.round(travelSpeed),
        min: Math.round(travelSpeed * 0.7),
        max: Math.round(travelSpeed * 1.3),
        reason: `${wpsData.process} yöntemi ve ${wpsData.position} pozisyonu için`,
        confidence: 'medium'
      });
    }

    let preheatTemp = 0;
    if (wpsData.materialType?.includes('Çelik')) {
      if (wpsData.thickness >= 20) {
        preheatTemp = 150;
      } else if (wpsData.thickness >= 10) {
        preheatTemp = 100;
      }
      
      if (wpsData.materialType.includes('Düşük Alaşımlı')) {
        preheatTemp += 50;
      }
    } else if (wpsData.materialType?.includes('Alüminyum')) {
      if (wpsData.thickness >= 12) {
        preheatTemp = 80;
      }
    }

    if (preheatTemp > 0) {
      recommendations.push({
        parameter: 'preheatTemp',
        value: preheatTemp,
        min: Math.max(0, preheatTemp - 25),
        max: preheatTemp + 25,
        reason: `${wpsData.materialType} ${wpsData.thickness}mm kalınlık için`,
        confidence: 'medium'
      });
    }
  }

  return recommendations;
};

const WpsGenerator: React.FC = () => {
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [autoApplyRecommendations, setAutoApplyRecommendations] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [wpsData, setWpsData] = useState<Partial<WPSData>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [passData, setPassData] = useState<PassData[]>([]);

  useEffect(() => {
    const recs = calculateRecommendations(wpsData);
    setRecommendations(recs);
    
    const passes = calculatePassData(wpsData);
    setPassData(passes);
    if (passes.length > 0) {
      setWpsData(prev => ({ ...prev, passes, passCount: passes.length }));
    }

    // Otomatik öneri uygulama - sadece boş alanları doldur
    if (autoApplyRecommendations && recs.length > 0) {
      setTimeout(() => {
        recs.forEach(rec => {
          const currentValue = wpsData[rec.parameter as keyof WPSData];
          // Sadece henüz doldurulmamış alanları otomatik uygula
          if (!currentValue || currentValue === 0 || currentValue === '') {
            console.log(`Otomatik uygulama: ${rec.parameter} = ${rec.value}`);
            applyRecommendation(rec);
          }
        });
      }, 200); // Daha uzun gecikme ile state güncellemelerinin çakışmasını önle
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    wpsData.materialType,
    wpsData.materialGroup, 
    wpsData.thickness, 
    wpsData.jointType,
    wpsData.process, 
    wpsData.position, 
    wpsData.wireSize, 
    wpsData.grooveType,
    wpsData.grooveAngle,
    wpsData.rootOpening,
    wpsData.gasComposition,
    autoApplyRecommendations
  ]);

  const updateWpsData = (field: keyof WPSData, value: any) => {
    setWpsData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Kaynak ağzı türü değiştiğinde otomatik olarak önerilen açıyı set et
      if (field === 'grooveType' && value) {
        const selectedGroove = GROOVE_TYPES.find(g => g.code === value);
        if (selectedGroove) {
          newData.grooveAngle = selectedGroove.recommendedAngle;
          
          // Kök açıklığı önerileri
          if (value === 'I' || value === 'SQUARE') {
            newData.rootOpening = 0; // I ve düz ağız genelde kapalı
          } else if (value === 'I_HEAVY') {
            newData.rootOpening = 1; // Kalın I ağzı için minimal açıklık
          } else if (value === 'V' || value === 'DOUBLE_V') {
            newData.rootOpening = (newData.thickness || 6) <= 6 ? 2 : 3; // V ağızları için standart
          } else if (value === 'U' || value === 'DOUBLE_U') {
            newData.rootOpening = (newData.thickness || 10) <= 10 ? 2 : 4; // U ağızları için
          } else if (value === 'X') {
            newData.rootOpening = Math.min(4, Math.max(2, Math.ceil((newData.thickness || 12) / 6))); // X ağzı için
          } else if (value === 'FILLET') {
            newData.rootOpening = 0; // Köşe kaynağında kök açıklığı yok
          } else {
            newData.rootOpening = 2; // Varsayılan
          }
        }
      }
      
      return newData;
    });
  };

  const applyRecommendation = (rec: Recommendation) => {
    if (rec.parameter === 'current') updateWpsData('current', rec.value as number);
    else if (rec.parameter === 'voltage') updateWpsData('voltage', rec.value as number);
    else if (rec.parameter === 'gasFlow') updateWpsData('gasFlow', rec.value as number);
    else if (rec.parameter === 'gasComposition') updateWpsData('gasComposition', rec.value as string);
    else if (rec.parameter === 'wireSpeed') updateWpsData('wireSpeed', rec.value as number);
    else if (rec.parameter === 'travelSpeed') updateWpsData('travelSpeed', rec.value as number);
    else if (rec.parameter === 'preheatTemp') updateWpsData('preheatTemp', rec.value as number);
    // Yeni öneriler
    else if (rec.parameter === 'process') updateWpsData('process', rec.value as string);
    else if (rec.parameter === 'position') updateWpsData('position', rec.value as string);
    else if (rec.parameter === 'wireSize') updateWpsData('wireSize', rec.value as number);
    else if (rec.parameter === 'grooveType') updateWpsData('grooveType', rec.value as string);
  };

  const applyAllRecommendations = () => {
    recommendations.forEach(rec => {
      // Tüm önerileri uygula (dolu alanları da güncelle)
      applyRecommendation(rec);
    });
  };

  const applyEmptyRecommendations = () => {
    recommendations.forEach(rec => {
      // Sadece henüz doldurulmamış alanları uygula
      const currentValue = wpsData[rec.parameter as keyof WPSData];
      if (!currentValue || currentValue === 0 || currentValue === '') {
        applyRecommendation(rec);
      }
    });
  };

  const generateEnhancedPDF = () => {
    const doc = new jsPDF();
    const wpsNumber = `WPS-${Date.now().toString().slice(-6)}`;
    
    doc.setFont('helvetica');
    
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('KADEME A.S.', 20, 22, { align: 'left' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Kaynak Teknolojileri', 20, 28, { align: 'left' });
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('KAYNAK PROSEDUR SARTNAMESI', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('(Welding Procedure Specification)', 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('EN ISO 15609-1 Uyumlu', 105, 35, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    let y = 55;
    
    autoTable(doc, {
      startY: y,
      head: [['WPS BILGILERI', '']],
      body: [
        ['WPS Numarasi', wpsNumber],
        ['Revizyon', '1'],
        ['Hazirlanma Tarihi', new Date().toLocaleDateString('tr-TR')],
        ['Standart', 'EN ISO 15609-1'],
        ['Durum', 'Onayli']
      ],
      theme: 'grid',
      styles: { font: 'helvetica', fontStyle: 'normal' },
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 11, fontStyle: 'bold', font: 'helvetica' },
      bodyStyles: { fontSize: 10, font: 'helvetica' },
      columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: 120 } }
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
    
    autoTable(doc, {
      startY: y,
      head: [['MALZEME BILGILERI', '']],
      body: [
        ['Ana Malzeme Turu', wpsData.materialType || 'Belirtilmemis'],
        ['Malzeme Grubu/Sinifi', wpsData.materialGroup || 'Belirtilmemis'],
        ['Malzeme Kalinligi', `${wpsData.thickness || 0} mm`],
        ['Birlestirme Tipi', wpsData.jointType === 'BUTT' ? 'Alin Birlestirme' :
          wpsData.jointType === 'FILLET' ? 'Kose Birlestirme' :
          wpsData.jointType === 'LAP' ? 'Bindirme Birlestirme' :
          wpsData.jointType || 'Belirtilmemis'],
        ['Standart/Norm', 'EN 10025 / ASTM'],
        ['Kimyasal Kompozisyon', 'Standart uyumlu']
      ],
      theme: 'grid',
      styles: { font: 'helvetica', fontStyle: 'normal' },
      headStyles: { fillColor: [46, 204, 113], textColor: 255, fontSize: 11, fontStyle: 'bold', font: 'helvetica' },
      bodyStyles: { fontSize: 10, font: 'helvetica' },
      columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: 120 } }
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
    
    autoTable(doc, {
      startY: y,
      head: [['KAYNAK YONTEMI VE PARAMETRELERI', '']],
      body: [
        ['Kaynak Yontemi', wpsData.process || 'Belirtilmemis'],
        ['Kaynak Pozisyonu', wpsData.position || 'Belirtilmemis'],
        ['Tel/Elektrod Capi', `${wpsData.wireSize || 0} mm`],
        ['Koruyucu Gaz', wpsData.gasComposition || 'Belirtilmemis'],
        ['Akim Siddeti', `${wpsData.current || 0} A`],
        ['Kaynak Voltaji', `${wpsData.voltage || 0} V`],
        ['Gaz Debisi', `${wpsData.gasFlow || 0} L/dk`],
        ['Tel Hizi', `${wpsData.wireSpeed || 0} m/dk`],
        ['Kaynak Hizi', `${wpsData.travelSpeed || 0} mm/dk`],
        ['On Isitma Sicakligi', `${wpsData.preheatTemp || 0} C`]
      ],
      theme: 'grid',
      styles: { font: 'helvetica', fontStyle: 'normal' },
      headStyles: { fillColor: [230, 126, 34], textColor: 255, fontSize: 11, fontStyle: 'bold', font: 'helvetica' },
      bodyStyles: { fontSize: 10, font: 'helvetica' },
      columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' }, 1: { cellWidth: 100 } }
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
    
    if (wpsData.passes && wpsData.passes.length > 0) {
      const passTableData = wpsData.passes.map(pass => [
        `${pass.passNumber}. Paso`,
        pass.passType === 'root' ? 'Kok' : pass.passType === 'fill' ? 'Ara' : 'Kapak',
        `${pass.current} A`,
        `${pass.voltage} V`,
        `${pass.wireSpeed} m/dk`,
        `${pass.travelSpeed} mm/dk`
      ]);

      autoTable(doc, {
        startY: y,
        head: [['PASO BAZLI PARAMETRELER']],
        body: [],
        theme: 'grid',
        styles: { font: 'helvetica', fontStyle: 'normal' },
        headStyles: { fillColor: [155, 89, 182], textColor: 255, fontSize: 11, fontStyle: 'bold', font: 'helvetica', halign: 'center' },
        columnStyles: { 0: { cellWidth: 180 } }
      });
      
      y = (doc as any).lastAutoTable.finalY + 2;

      autoTable(doc, {
        startY: y,
        head: [['Paso No', 'Paso Tipi', 'Akim (A)', 'Voltaj (V)', 'Tel Hizi', 'Kaynak Hizi']],
        body: passTableData,
        theme: 'grid',
        styles: { font: 'helvetica', fontStyle: 'normal', fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182], textColor: 255, fontSize: 9, fontStyle: 'bold', font: 'helvetica', halign: 'center' },
        bodyStyles: { fontSize: 8, font: 'helvetica', halign: 'center' },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          1: { cellWidth: 28, fontStyle: 'bold' },
          2: { cellWidth: 25 },
          3: { cellWidth: 28 },
          4: { cellWidth: 30 },
          5: { cellWidth: 32 }
        }
      });
      
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    if (wpsData.grooveType) {
      autoTable(doc, {
        startY: y,
        head: [['KAYNAK AGZI BILGILERI', '']],
        body: [
          ['Agiz Turu', wpsData.grooveType === 'I' ? 'I Kaynak Agzi (Ince)' :
          wpsData.grooveType === 'I_HEAVY' ? 'I Kaynak Agzi (Kalin)' :
          wpsData.grooveType === 'V' ? 'V Agzi' :
          wpsData.grooveType === 'U' ? 'U Agzi' :
          wpsData.grooveType === 'X' ? 'X Agzi (Cift V Simetrik)' :
          wpsData.grooveType === 'K' ? 'K Agzi (Asimetrik Cift V)' :
          wpsData.grooveType === 'Y' ? 'Y Agzi (Tek Tarafli Pah)' :
          wpsData.grooveType === 'DOUBLE_V' ? 'Cift V Agzi (Standart)' :
          wpsData.grooveType === 'DOUBLE_U' ? 'Cift U Agzi' :
          wpsData.grooveType === 'J' ? 'J Agzi' :
          wpsData.grooveType === 'FLARE_V' ? 'Kavisli V Agzi' :
          wpsData.grooveType === 'HV' ? 'Yarim V Agzi' :
          wpsData.grooveType === 'HU' ? 'Yarim U Agzi' :
          wpsData.grooveType === 'BEVEL' ? 'Pah Agzi' :
          wpsData.grooveType === 'SQUARE' ? 'Duz Agiz' :
          wpsData.grooveType === 'FILLET' ? 'Kose Kaynagi' :
          wpsData.grooveType || 'Belirtilmemis'],
          ['Agiz Acisi', `${wpsData.grooveAngle || 0} derece`],
          ['Kok Acikligi', `${wpsData.rootOpening || 0} mm`],
          ['Toplam Paso Sayisi', `${wpsData.passCount || 0} paso`],
        ],
        theme: 'grid',
        styles: { font: 'helvetica', fontStyle: 'normal' },
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 11, fontStyle: 'bold', font: 'helvetica' },
        bodyStyles: { fontSize: 10, font: 'helvetica' },
        columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: 120 } }
      });
      
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageHeight - 25, 210, 25, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Bu dokuman Kademe A.S. Akilli WPS Olusturucu sistemi tarafindan uretilmistir.', 105, pageHeight - 15, { align: 'center' });
    doc.text(`Olusturulma Tarihi: ${new Date().toLocaleString('tr-TR')} | EN ISO 15609-1 Standardi`, 105, pageHeight - 8, { align: 'center' });
    
    doc.save(`${wpsNumber}_Kaynak_Prosedur_Sartnamesi.pdf`);
  };

  const createWPS = () => {
    if (!wpsData.jointType || !wpsData.materialType || !wpsData.process || !wpsData.thickness) {
      // Form validasyon hatası - sessiz hata
      return;
    }
    
    const wpsNumber = `WPS-${Date.now().toString().slice(-6)}`;
    
    // WPS oluşturma onayı kaldırıldı - otomatik PDF oluşturma
      generateEnhancedPDF();
    
    setWpsData({});
  };

  const getFilteredSizes = () => {
    return wpsData.process ? WIRE_SIZES[wpsData.process as keyof typeof WIRE_SIZES] || [] : [];
  };

  const getFilteredGases = () => {
    return wpsData.process ? GAS_COMPOSITIONS[wpsData.process as keyof typeof GAS_COMPOSITIONS] || [] : [];
  };

  return (
    <MainContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Switch checked={showRecommendations} onChange={(e) => setShowRecommendations(e.target.checked)} />}
            label="Akıllı Öneriler"
          />
          <FormControlLabel
            control={
              <Switch 
                checked={autoApplyRecommendations} 
                onChange={(e) => setAutoApplyRecommendations(e.target.checked)}
                disabled={!showRecommendations}
              />
            }
            label="Otomatik Uygula"
            sx={{ 
              opacity: showRecommendations ? 1 : 0.5,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
                color: autoApplyRecommendations && showRecommendations ? 'primary.main' : 'text.secondary'
              }
            }}
          />
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={() => setPreviewOpen(true)}>
            Önizleme
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} size="large" onClick={createWPS}>
            WPS Oluştur
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Main Form */}
        <Box sx={{ flex: showRecommendations ? '1 1 66%' : '1 1 100%' }}>
          
          {/* Bölüm 1: Malzeme ve Birleştirme Bilgileri */}
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>
                <BusinessIcon /> Malzeme ve Birleştirme Bilgileri
              </SectionTitle>
              
              {/* Joint Type Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🔗 Birleştirme Tipi Seçimi
                  <Chip label="ÖNEMLİ" size="small" color="error" />
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {JOINT_TYPES.map((joint) => (
                    <Box key={joint.code} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: 2,
                          borderColor: wpsData.jointType === joint.code ? 'primary.main' : 'grey.300',
                          backgroundColor: wpsData.jointType === joint.code ? 'primary.50' : 'background.paper',
                          '&:hover': { borderColor: 'primary.main', backgroundColor: 'primary.50' }
                        }}
                        onClick={() => {
                          updateWpsData('jointType', joint.code);
                          // Birleştirme tipi değiştiğinde kaynak ağzını temizle
                          setWpsData(prev => ({ 
                            ...prev, 
                            jointType: joint.code, 
                            grooveType: '', 
                            grooveAngle: 0,
                            rootOpening: 0 
                          }));
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                              {joint.icon}
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {joint.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {joint.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {joint.applications.map((app, index) => (
                              <Chip key={index} label={app} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Material Properties */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Malzeme Türü</InputLabel>
                    <Select value={wpsData.materialType || ''} onChange={(e) => updateWpsData('materialType', e.target.value)}>
                      {MATERIAL_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Malzeme Grubu</InputLabel>
                    <Select 
                      value={wpsData.materialGroup || ''} 
                      onChange={(e) => updateWpsData('materialGroup', e.target.value)}
                      disabled={!wpsData.materialType}
                    >
                      {(MATERIAL_GROUPS[wpsData.materialType as keyof typeof MATERIAL_GROUPS] || []).map(group => (
                        <MenuItem key={group} value={group}>{group}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {wpsData.materialType ? `${wpsData.materialType} için uygun gruplar` : 'Önce malzeme türünü seçin'}
                    </FormHelperText>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Malzeme Kalınlığı"
                    type="number"
                    value={wpsData.thickness || ''}
                    onChange={(e) => updateWpsData('thickness', parseFloat(e.target.value) || 0)}
                    InputProps={{ endAdornment: <InputAdornment position="end"><span className="unit-text">mm</span></InputAdornment> }}
                    helperText="Kaynak edilecek malzeme kalınlığı"
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Bölüm 2: Kaynak Yöntemi ve Pozisyon */}
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>
                <BuildIcon /> Kaynak Yöntemi ve Pozisyon
              </SectionTitle>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Kaynak Yöntemi</InputLabel>
                    <Select value={wpsData.process || ''} onChange={(e) => updateWpsData('process', e.target.value)}>
                      {WELDING_PROCESSES.map(process => (
                        <MenuItem key={process.code} value={process.code}>{process.name}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Önce kaynak yöntemini seçin - tel/elektrod çapı, gaz ve ağız seçimini etkiler</FormHelperText>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Kaynak Pozisyonu</InputLabel>
                    <Select value={wpsData.position || ''} onChange={(e) => updateWpsData('position', e.target.value)}>
                      {Object.entries(POSITION_GROUPS).map(([groupName, positions]) => [
                        <MenuItem key={groupName} disabled sx={{ 
                          fontWeight: 'bold', 
                          backgroundColor: 'primary.main', 
                          color: 'primary.contrastText',
                          '&.Mui-disabled': { 
                            opacity: 1,
                            color: 'primary.contrastText'
                          }
                        }}>
                          {groupName}
                        </MenuItem>,
                        ...positions.map(pos => (
                          <MenuItem key={pos.code} value={pos.code} sx={{ pl: 3 }}>
                            {pos.name}
                          </MenuItem>
                        ))
                      ]).flat()}
                    </Select>
                    <FormHelperText>EN ISO 6947 standardına uygun pozisyonlar</FormHelperText>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Tel/Elektrod Çapı</InputLabel>
                    <Select 
                      value={wpsData.wireSize || ''} 
                      onChange={(e) => updateWpsData('wireSize', Number(e.target.value))}
                      disabled={!wpsData.process}
                    >
                      {getFilteredSizes().map(size => (
                        <MenuItem key={size} value={size}>{size} <span className="unit-text">mm</span></MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {wpsData.process ? `${wpsData.process} için standart çaplar` : 'Önce kaynak yöntemini seçin'}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Gaz Bileşimi</InputLabel>
                    <Select 
                      value={wpsData.gasComposition || ''} 
                      onChange={(e) => updateWpsData('gasComposition', e.target.value)}
                      disabled={!wpsData.process}
                    >
                      {getFilteredGases().map(gas => (
                        <MenuItem key={gas} value={gas}>{gas}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {wpsData.process === 'MMA' ? 'El arkı kaynağı gaz kullanmaz' : 
                       wpsData.process ? `${wpsData.process} için EN 14175 standart gazları` : 
                       'Önce kaynak yöntemini seçin'}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Bölüm 3: Kaynak Ağzı Tasarımı */}
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>
                <ConstructionIcon /> Kaynak Ağzı Tasarımı
              </SectionTitle>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth disabled={!wpsData.jointType}>
                    <InputLabel>Kaynak Ağzı Türü</InputLabel>
                    <Select value={wpsData.grooveType || ''} onChange={(e) => updateWpsData('grooveType', e.target.value)}>
                      {GROOVE_TYPES.filter(groove => 
                        groove.jointTypes.includes(wpsData.jointType || '') &&
                        (!wpsData.thickness || 
                         (wpsData.thickness >= groove.minThickness && wpsData.thickness <= groove.maxThickness))
                      ).map(groove => (
                        <MenuItem key={groove.code} value={groove.code}>
                          <Tooltip title={groove.description || ''} placement="right">
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body1" fontWeight="500">{groove.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                {groove.minThickness}-{groove.maxThickness}<span className="unit-text">mm</span>
                              </Typography>
                            </Box>
                          </Tooltip>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {!wpsData.jointType ? 'Önce birleştirme tipi seçiniz' : 
                       !wpsData.process ? 'Birleştirme tipi seçildi - kaynak yöntemi de seçtikten sonra daha iyi filtreler' :
                       `${JOINT_TYPES.find(j => j.code === wpsData.jointType)?.name} için uygun ağız türleri`}
                    </FormHelperText>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                  <TextField
                    fullWidth
                    label="Ağız Açısı"
                    type="number"
                    value={wpsData.grooveAngle || ''}
                    onChange={(e) => updateWpsData('grooveAngle', parseFloat(e.target.value) || 0)}
                    InputProps={{ endAdornment: <InputAdornment position="end">°</InputAdornment> }}
                    helperText={
                      wpsData.grooveType ? 
                        `Önerilen: ${GROOVE_TYPES.find(g => g.code === wpsData.grooveType)?.recommendedAngle}° (${wpsData.grooveType} ağzı için)` :
                        'Önce kaynak ağzı türünü seçin'
                    }
                  />
                </Box>

                <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                  <TextField
                    fullWidth
                    label="Kök Açıklığı"
                    type="number"
                    value={wpsData.rootOpening || ''}
                    onChange={(e) => updateWpsData('rootOpening', parseFloat(e.target.value) || 0)}
                    InputProps={{ endAdornment: <InputAdornment position="end"><span className="unit-text">mm</span></InputAdornment> }}
                    helperText={(() => {
                      if (!wpsData.grooveType) return 'Önce kaynak ağzı türünü seçin';
                      if (wpsData.grooveType === 'I') return 'I kaynak ağzı için genelde 0-1mm';
                      if (wpsData.grooveType === 'I_HEAVY') return 'Kalın I ağzı için genelde 1-2mm';
                      if (wpsData.grooveType === 'SQUARE') return 'Düz ağız için 0-2mm';
                      if (wpsData.grooveType === 'FILLET') return 'Köşe kaynağı için kök açıklığı gerekli değil';
                      if (wpsData.grooveType === 'V') return `V ağzı ${wpsData.thickness}mm için önerilen: ${(wpsData.thickness || 6) <= 6 ? '2mm' : '3mm'}`;
                      if (wpsData.grooveType === 'U') return `U ağzı ${wpsData.thickness}mm için önerilen: ${(wpsData.thickness || 10) <= 10 ? '2mm' : '4mm'}`;
                      if (wpsData.grooveType === 'X') return `X ağzı ${wpsData.thickness}mm için önerilen: ${Math.min(4, Math.max(2, Math.ceil((wpsData.thickness || 12) / 6)))}mm`;
                      return 'V/U ağızları için genelde 2-4mm arası';
                    })()}
                  />
                </Box>
              </Box>



              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Hesaplanan Paso Sayısı: {passData.length} paso
                  {wpsData.grooveType && wpsData.thickness && (
                    <Chip 
                      label={`${wpsData.grooveType} - ${wpsData.thickness}mm - ${wpsData.grooveAngle}°`} 
                      size="small" 
                      color="info" 
                      sx={{ ml: 1, '& .MuiChip-label': { whiteSpace: 'nowrap' } }}
                    />
                  )}
                </Typography>
                {passData.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip 
                        label={`${passData.filter(p => p.passType === 'root').length} Kök`}
                        size="small" 
                        color="error" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${passData.filter(p => p.passType === 'fill').length} Ara`}
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${passData.filter(p => p.passType === 'cap').length} Kapak`}
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {passData.map(pass => (
                        <Chip 
                          key={pass.passNumber}
                          label={`${pass.passNumber}. ${pass.passType === 'root' ? 'Kök' : pass.passType === 'fill' ? 'Ara' : 'Kapak'}`}
                          size="small"
                          color={pass.passType === 'root' ? 'error' : pass.passType === 'fill' ? 'warning' : 'success'}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </StyledCard>

          {/* Bölüm 4: Kaynak Parametreleri */}
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>
                <TuneIcon /> Kaynak Parametreleri
              </SectionTitle>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Akım"
                    type="number"
                    value={wpsData.current || ''}
                    onChange={(e) => updateWpsData('current', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            A
                            {recommendations.find(r => r.parameter === 'current') && (
                              <Tooltip title="Akıllı öneri mevcut">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => applyRecommendation(recommendations.find(r => r.parameter === 'current')!)}
                                >
                                  <RecommendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Voltaj"
                    type="number"
                    value={wpsData.voltage || ''}
                    onChange={(e) => updateWpsData('voltage', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            V
                            {recommendations.find(r => r.parameter === 'voltage') && (
                              <Tooltip title="Akıllı öneri mevcut">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => applyRecommendation(recommendations.find(r => r.parameter === 'voltage')!)}
                                >
                                  <RecommendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Gaz Debisi"
                    type="number"
                    value={wpsData.gasFlow || ''}
                    onChange={(e) => updateWpsData('gasFlow', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            L/dk
                            {recommendations.find(r => r.parameter === 'gasFlow') && (
                              <Tooltip title="Akıllı öneri mevcut">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => applyRecommendation(recommendations.find(r => r.parameter === 'gasFlow')!)}
                                >
                                  <RecommendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Tel Hızı"
                    type="number"
                    value={wpsData.wireSpeed || ''}
                    onChange={(e) => updateWpsData('wireSpeed', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            m/dk
                            {recommendations.find(r => r.parameter === 'wireSpeed') && (
                              <Tooltip title="Akıllı öneri mevcut">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => applyRecommendation(recommendations.find(r => r.parameter === 'wireSpeed')!)}
                                >
                                  <RecommendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Kaynak Hızı"
                    type="number"
                    value={wpsData.travelSpeed || ''}
                    onChange={(e) => updateWpsData('travelSpeed', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            mm/dk
                            {recommendations.find(r => r.parameter === 'travelSpeed') && (
                              <Tooltip title="Akıllı öneri mevcut">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => applyRecommendation(recommendations.find(r => r.parameter === 'travelSpeed')!)}
                                >
                                  <RecommendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Ön Isıtma"
                    type="number"
                    value={wpsData.preheatTemp || ''}
                    onChange={(e) => updateWpsData('preheatTemp', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            °C
                            {recommendations.find(r => r.parameter === 'preheatTemp') && (
                              <Tooltip title="Akıllı öneri mevcut">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => applyRecommendation(recommendations.find(r => r.parameter === 'preheatTemp')!)}
                                >
                                  <RecommendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>

        {/* Recommendations Panel */}
        {showRecommendations && (
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <RecommendationCard>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><RecommendIcon /></Avatar>}
                title="WPS Parametre Optimizasyonu"
                subheader={
                  recommendations.length === 0 
                    ? "Parametre analizi bekleniyor" 
                    : `${recommendations.length} optimizasyon önerisi hazır`
                }
              />
              <CardContent>
                {/* Status ve Butonlar */}
                {recommendations.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: autoApplyRecommendations ? 'success.50' : 'grey.50',
                    borderRadius: 1,
                    border: 1,
                    borderColor: autoApplyRecommendations ? 'success.200' : 'grey.200'
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {/* Durum Göstergesi */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' }, 
                        gap: 1,
                        flexWrap: 'wrap'
                      }}>
                        <Chip 
                          icon={<PlaylistAddCheckIcon />}
                          label={autoApplyRecommendations ? "Otomatik Opt." : "Manuel Kontrol"} 
                          size="small" 
                          color={autoApplyRecommendations ? "success" : "default"}
                          variant="filled"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            minWidth: 'auto'
                          }}
                        />
                        {autoApplyRecommendations && (
                          <Typography 
                            variant="caption" 
                            color="success.dark"
                            sx={{ 
                              fontSize: '0.7rem',
                              lineHeight: 1.2,
                              flex: 1,
                              minWidth: 0
                            }}
                          >
                            EN ISO 15609-1 uygun gerçek zamanlı optimizasyon
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Butonlar */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        flexWrap: 'wrap',
                        '& .MuiButton-root': {
                          fontSize: '0.75rem',
                          minWidth: 'auto',
                          px: 1.5
                        }
                      }}>
                        {autoApplyRecommendations ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={applyAllRecommendations}
                            startIcon={<PlaylistAddCheckIcon />}
                            color="primary"
                          >
                            Değerleri Güncelle
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={applyAllRecommendations}
                              startIcon={<PlaylistAddCheckIcon />}
                            >
                              Tümünü Uygula
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={applyEmptyRecommendations}
                            >
                              Boş Alanları Doldur
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
                {recommendations.length === 0 ? (
                  <Alert severity="info">
                    Öneriler için malzeme ve kaynak yöntemi bilgilerini doldurun
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recommendations.map((rec, index) => (
                      <Card key={index} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                  <Typography variant="subtitle2" fontWeight={600}>
                          {rec.parameter === 'current' && 'Akım (A)'}
                          {rec.parameter === 'voltage' && 'Voltaj (V)'}
                          {rec.parameter === 'gasFlow' && 'Gaz Debisi (L/dk)'}
                          {rec.parameter === 'gasComposition' && 'Gaz Bileşimi'}
                          {rec.parameter === 'wireSpeed' && 'Tel Hızı (m/dk)'}
                          {rec.parameter === 'travelSpeed' && 'Kaynak Hızı (mm/dk)'}
                          {rec.parameter === 'preheatTemp' && 'Ön Isıtma (°C)'}
                          {rec.parameter === 'process' && 'Kaynak Yöntemi'}
                          {rec.parameter === 'position' && 'Kaynak Pozisyonu'}
                          {rec.parameter === 'wireSize' && 'Tel/Elektrod Çapı (mm)'}
                          {rec.parameter === 'grooveType' && 'Kaynak Ağzı Türü'}
                        </Typography>
                          <Chip 
                            label={rec.confidence === 'high' ? 'Güvenilir' : 'Orta'} 
                            size="small"
                            color={rec.confidence === 'high' ? 'success' : 'warning'}
                          />
                        </Box>
                        
                        <Typography variant="h6" color="primary" gutterBottom>
                          {typeof rec.value === 'number' ? rec.value : rec.value}
                          {rec.min > 0 && ` (${rec.min}–${rec.max})`}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {rec.reason}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tooltip title="EN ISO 15609-1">
                            <Chip icon={<InfoIcon />} label="Standart" size="small" variant="outlined" />
                          </Tooltip>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => applyRecommendation(rec)}
                            startIcon={<PlaylistAddCheckIcon />}
                          >
                            Uygula
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </RecommendationCard>

            {/* Pass Statistics */}
            {passData.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><TrendingUpIcon /></Avatar>}
                  title="Paso İstatistikleri"
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Toplam Paso:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {passData.length} paso
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Kök Pasoları:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {passData.filter(p => p.passType === 'root').length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Ara Pasoları:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {passData.filter(p => p.passType === 'fill').length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Kapak Pasoları:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {passData.filter(p => p.passType === 'cap').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>WPS Dokümanı Önizleme</DialogTitle>
        <DialogContent>
          <Typography variant="h5" gutterBottom align="center" sx={{ mt: 2 }}>
            KAYNAK PROSEDÜR ŞARTNAMESİ (WPS)
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell><strong>WPS No:</strong></TableCell>
                  <TableCell>WPS-{Date.now().toString().slice(-6)}</TableCell>
                  <TableCell><strong>Revizyon:</strong></TableCell>
                  <TableCell>1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Birleştirme Tipi:</strong></TableCell>
                  <TableCell>{JOINT_TYPES.find(j => j.code === wpsData.jointType)?.name || 'Belirtilmemiş'}</TableCell>
                  <TableCell><strong>Malzeme Türü:</strong></TableCell>
                  <TableCell>{wpsData.materialType}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Kalınlık:</strong></TableCell>
                  <TableCell>{wpsData.thickness} <span className="unit-text">mm</span></TableCell>
                  <TableCell><strong>Kaynak Ağzı:</strong></TableCell>
                  <TableCell>{GROOVE_TYPES.find(g => g.code === wpsData.grooveType)?.name || 'Belirtilmemiş'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Kaynak Yöntemi:</strong></TableCell>
                  <TableCell>{wpsData.process}</TableCell>
                  <TableCell><strong>Pozisyon:</strong></TableCell>
                  <TableCell>{wpsData.position}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Akım:</strong></TableCell>
                  <TableCell>{wpsData.current} A</TableCell>
                  <TableCell><strong>Voltaj:</strong></TableCell>
                  <TableCell>{wpsData.voltage} V</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Kapat</Button>
          <Button variant="contained" startIcon={<PdfIcon />} onClick={generateEnhancedPDF}>PDF İndir</Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default WpsGenerator; 