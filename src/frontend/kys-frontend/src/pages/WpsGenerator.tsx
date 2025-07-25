import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  LinearProgress,
  Divider,
  FormHelperText,
  InputAdornment,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CardHeader
} from '@mui/material';
import {
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  GetApp as ExportIcon,

  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  AutoAwesome as RecommendIcon,
  Straighten as StraightenIcon,
  Speed as SpeedIcon,
  Whatshot as WhatshotIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Science as ScienceIcon,
  Tune as TuneIcon,
  Clear as ClearIcon,

} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// TypeScript tip deklarasyonu
declare global {
  namespace jsPDF {
    interface jsPDF {
      lastAutoTable: { finalY: number };
    }
  }
}

// Types
interface WPSData {
  id?: string;
  wpsNumber?: string;
  createdDate?: string;
  createdBy?: string;
  status?: 'draft' | 'approved' | 'active';
  revision?: number;
  materialType: string;
  materialGroup: string;
  thickness: number;
  jointType: string;
  connectionType: string;
  pipeDiameter?: number;
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

interface JointType {
  code: string;
  name: string;
  icon: string;
  description: string;
  applications: string[];
}

interface WeldingProcess {
  code: string;
  name: string;
  description: string;
  applications: string[];
}

interface GrooveType {
  code: string;
  name: string;
  minThickness: number;
  maxThickness: number;
  recommendedAngle: number;
  description: string;
  jointTypes: string[];
}



// Constants
const JOINT_TYPES: JointType[] = [
  { 
    code: 'BUTT', 
    name: 'Alın Birleştirme',
    icon: 'BT',
    description: 'İki parçanın uç uca birleştirilmesi',
    applications: ['Basınçlı kaplar', 'Boru hatları', 'Yapı çelikleri']
  },
  { 
    code: 'FILLET', 
    name: 'Köşe Birleştirme',
    icon: 'FL',
    description: 'İki parçanın dik açıyla birleştirilmesi',
    applications: ['Köşe bağlantıları', 'Destek elemanları', 'Flanş bağlantıları']
  },
  { 
    code: 'LAP', 
    name: 'Bindirme Birleştirme',
    icon: 'LP',
    description: 'İki parçanın üst üste bindirilerek kaynak edilmesi',
    applications: ['Sacların birleştirilmesi', 'Tamir kaynakları']
  },
  {
    code: 'EDGE',
    name: 'Kenar Birleştirme',
    icon: 'EG',
    description: 'İki parçanın kenarlarının yan yana kaynak edilmesi',
    applications: ['İnce saclar', 'Özel uygulamalar']
  }
];

const WELDING_PROCESSES: WeldingProcess[] = [
  {
    code: 'MIG/MAG',
    name: 'MIG/MAG (135/136)',
    description: 'Metal Inert/Active Gas Kaynağı',
    applications: ['Çelik', 'Paslanmaz çelik', 'Alüminyum']
  },
  {
    code: 'TIG',
    name: 'TIG (141)',
    description: 'Tungsten Inert Gas Kaynağı',
    applications: ['Paslanmaz çelik', 'Alüminyum', 'Hassas kaynaklar']
  },
  {
    code: 'MMA',
    name: 'MMA (111)',
    description: 'Manuel Metal Arc Kaynağı - Elektrodlu El Arkı',
    applications: ['Çelik', 'Dökme demir', 'Bakım kaynakları', 'Saha kaynakları']
  },
  {
    code: '111',
    name: '111 - El Arkı Kaynağı',
    description: 'Manuel Metal Arc - Elektrodlu Kaynak',
    applications: ['Çelik yapılar', 'Saha montajı', 'Bakım-onarım']
  }
];

const MATERIAL_TYPES = [
  'Karbon Çelik',
  'Düşük Alaşımlı Çelik',
  'Yüksek Alaşımlı Çelik',
  'Paslanmaz Çelik',
  'Alüminyum Alaşımları',
  'Dökme Demir',
  'Nikel Alaşımları',
  'Bakır Alaşımları'
];


const CONNECTION_TYPES = [
  {
    code: 'PIPE_PIPE',
    name: 'Boru - Boru',
    icon: '⫽',
    description: 'İki borunun birleştirilmesi',
    needsDiameter: true
  },
  {
    code: 'PLATE_PLATE', 
    name: 'Plaka - Plaka',
    icon: '▬',
    description: 'İki plakanın birleştirilmesi',
    needsDiameter: false
  },
  {
    code: 'PIPE_PLATE',
    name: 'Boru - Plaka', 
    icon: '⫽▬',
    description: 'Boru ile plakanın birleştirilmesi',
    needsDiameter: true
  }
];

const WELDING_POSITIONS = [
  { code: 'PA', name: 'PA - Düz Pozisyon' },
  { code: 'PB', name: 'PB - Yatay Pozisyon' },
  { code: 'PC', name: 'PC - Dikey Yukarı' },
  { code: 'PD', name: 'PD - Dikey Aşağı' },
  { code: 'PE', name: 'PE - Tavan Pozisyonu' },
  { code: 'PF', name: 'PF - Dikey Yukarı (Köşe)' },
  { code: 'PG', name: 'PG - Dikey Aşağı (Köşe)' }
];

const GROOVE_TYPES = [
  {
    code: 'I',
    name: 'I Kaynak Ağzı (İnce)',
    minThickness: 0.5,
    maxThickness: 6,
    recommendedAngle: 0,
    description: 'Düz kesim, ince malzemeler için',
    jointTypes: ['BUTT']
  },
  {
    code: 'I_HEAVY',
    name: 'I Kaynak Ağzı (Kalın)',
    minThickness: 3,
    maxThickness: 12,
    recommendedAngle: 0,
    description: 'Düz kesim, orta kalınlık malzemeler için',
    jointTypes: ['BUTT']
  },
  {
    code: 'V',
    name: 'V Ağzı',
    minThickness: 6,
    maxThickness: 25,
    recommendedAngle: 60,
    description: 'Tek taraflı V ağzı',
    jointTypes: ['BUTT']
  },
  {
    code: 'U',
    name: 'U Ağzı',
    minThickness: 15,
    maxThickness: 40,
    recommendedAngle: 20,
    description: 'U şeklinde hazırlık',
    jointTypes: ['BUTT']
  },
  {
    code: 'X',
    name: 'X Ağzı (Çift V Simetrik)',
    minThickness: 20,
    maxThickness: 100,
    recommendedAngle: 60,
    description: 'Çift taraflı V ağzı',
    jointTypes: ['BUTT']
  },
  {
    code: 'FILLET',
    name: 'Köşe Ağzı',
    minThickness: 1,
    maxThickness: 50,
    recommendedAngle: 90,
    description: 'Köşe kaynak ağzı',
    jointTypes: ['FILLET']
  }
];

const WIRE_SIZES = {
  'MIG/MAG': [0.8, 1.0, 1.2, 1.6, 2.0, 2.4],
  'TIG': [1.6, 2.0, 2.4, 3.2, 4.0],
  'MMA': [2.5, 3.2, 4.0, 5.0, 6.0],
  '111': [2.5, 3.2, 4.0, 5.0, 6.0]
};

const GAS_COMPOSITIONS = {
  'MIG/MAG': [
    'Ar + 18% CO2 (EN ISO 14175: M21)',
    'Ar + 8% CO2 (EN ISO 14175: M12)',
    'Ar + 5% CO2 (EN ISO 14175: M13)',
    '100% CO2',
    'Ar + 2% O2 (EN ISO 14175: M11)'
  ],
  'TIG': [
    '100% Ar (EN ISO 14175: I1)',
    'Ar + 2% H2 (EN ISO 14175: I2)',
    'Ar + 30% He (EN ISO 14175: I3)',
    '100% He'
  ],
  'MMA': ['Gaz Kullanılmaz'],
  '111': ['Gaz Kullanılmaz']
};

const MATERIAL_GROUPS = {
  'Karbon Çelik': [
    'S235 JR - Genel Yapı Çeliği (235 MPa)',
    'S275 JR - Orta Mukavemetli Yapı Çeliği (275 MPa)', 
    'S355 JR - Yüksek Mukavemetli Yapı Çeliği (355 MPa)',
    'S460 NH - Ultra Yüksek Mukavemetli Çelik (460 MPa)',
    'S690 QL - Sertleştirilmiş Yüksek Mukavemetli Çelik (690 MPa)'
  ],
  'Düşük Alaşımlı Çelik': [
    'P235GH - Basınçlı Kap Çeliği (235 MPa)',
    'P265GH - Orta Sıcaklık Basınçlı Kap (265 MPa)',
    'P355GH - Yüksek Sıcaklık Basınçlı Kap (355 MPa)',
    'P460GH - Ultra Yüksek Basınçlı Kap (460 MPa)',
    'P690GH - Kritik Basınçlı Sistemler (690 MPa)',
    '16Mo3 - Yüksek Sıcaklık Servis Çeliği',
    '15NiCuMoNb5 - Nükleer Sınıf Çelik'
  ],
  'Yüksek Alaşımlı Çelik': [
    '25CrMo4 - Krom-Molibden Alaşımlı Çelik',
    '42CrMo4 - Yüksek Mukavemetli Krom-Molibden',
    '34CrNiMo6 - Nikel-Krom-Molibden Alaşımı',
    '30CrNiMo8 - Ağır Hizmet Tipi Alaşımlı Çelik',
    '36CrNiMo4 - Otomotiv Sınıfı Alaşımlı Çelik'
  ],
  'Paslanmaz Çelik': [
    'AISI 304 - 18/8 Ostenitik Paslanmaz (Cr18-Ni8)',
    'AISI 316 - Molibden İlaveli Ostenitik (Cr18-Ni12-Mo2)',
    'AISI 321 - Titanyum Stabilize Ostenitik',
    'AISI 347 - Niyobyum Stabilize Ostenitik', 
    'AISI 410 - Martensitik Paslanmaz (Cr12)',
    'AISI 430 - Ferritik Paslanmaz (Cr17)',
    'AISI 316L - Düşük Karbonlu Ostenitik',
    'Duplex 2205 - Çift Fazlı Paslanmaz (σ=850MPa)'
  ],
  'Alüminyum Alaşımları': [
    'AA1050 - Saf Alüminyum (%99.5 Al)',
    'AA1100 - Ticari Saf Alüminyum (%99.0 Al)',
    'AA5083 - Denizcilik Sınıfı (Al-Mg4.5)',
    'AA6061 - Yapısal Alaşım (Al-Mg-Si)',
    'AA6082 - Yüksek Mukavemetli (Al-Mg-Si)',
    'AA7075 - Havacılık Sınıfı (Al-Zn-Mg-Cu)',
    'AA5754 - Otomotiv Levha Alaşımı',
    'AA2024 - Havacılık Alaşımı (Al-Cu-Mg)'
  ],
  'Dökme Demir': [
    'EN-GJL-200 - Gri Dökme Demir (σ=200MPa)',
    'EN-GJL-250 - Yüksek Mukavemetli Gri Dökme (σ=250MPa)',
    'EN-GJS-400 - Küresel Grafitli Dökme (σ=400MPa)',
    'EN-GJS-500 - Yüksek Mukavemetli Küresel Grafitli (σ=500MPa)',
    'EN-GJV-300 - Vermiküler Grafitli Dökme Demir',
    'EN-GJMW-350-4 - Temperleme Dökme Demir'
  ],
  'Nikel Alaşımları': [
    'Inconel 600 - Nikel-Krom Süper Alaşım (Ni76-Cr15)',
    'Inconel 625 - Nikel-Krom-Molibden (Ni58-Cr22-Mo9)',
    'Monel 400 - Nikel-Bakır Alaşımı (Ni67-Cu28)',
    'Hastelloy C276 - Korozyon Dirençli Süper Alaşım',
    'Inconel 718 - Yüksek Sıcaklık Süper Alaşım',
    'Nimonic 80A - Yüksek Sıcaklık Çalışma Alaşımı'
  ],
  'Bakır Alaşımları': [
    'CuZn37 - Pirinç Alaşımı (Cu63-Zn37)',
    'CuSn8 - Fosfor Bronz (Cu92-Sn8)',
    'CuNi10Fe1Mn - Küpronikel (Cu90-Ni10)',
    'CuAl10Fe3 - Alüminyum Bronz',
    'CuBe2 - Berilyum Bronz (Yüksek Mukavemet)',
    'CuZn39Pb3 - Serbest İşleme Pirinç'
  ]
};



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

  // 3. Tel/Elektrod Çapı Önerisi (Kalınlık ve yönteme göre) - İyileştirilmiş
  if (wpsData.thickness && wpsData.process && !wpsData.wireSize) {
    let suggestedWireSize = 0;
    let reason = '';

    if (wpsData.process === 'MIG/MAG') {
      if (wpsData.thickness <= 2) {
        suggestedWireSize = 0.8;
        reason = 'Çok ince malzeme için - minimum ısı girdisi, distorsiyon kontrolü';
      } else if (wpsData.thickness <= 4) {
        suggestedWireSize = 1.0;
        reason = 'İnce-orta kalınlık için optimum - iyi kontrolü';
      } else if (wpsData.thickness <= 8) {
        suggestedWireSize = 1.2;
        reason = 'Orta kalınlık için - verimlilik ve kalite dengesi';
      } else if (wpsData.thickness <= 15) {
        suggestedWireSize = 1.6;
        reason = 'Kalın malzeme için - yüksek depolama hızı';
      } else if (wpsData.thickness <= 25) {
        suggestedWireSize = 2.0;
        reason = 'Çok kalın malzeme için - maksimum verimlilik';
      } else {
        suggestedWireSize = 2.4;
        reason = 'Ultra kalın malzeme için - en yüksek verimlilik';
      }
    } else if (wpsData.process === 'TIG') {
      if (wpsData.thickness <= 2) {
        suggestedWireSize = 1.6;
        reason = 'İnce malzeme TIG kaynağı için ideal çap';
      } else if (wpsData.thickness <= 6) {
        suggestedWireSize = 2.0;
        reason = 'Orta kalınlık TIG için standart çap';
      } else if (wpsData.thickness <= 12) {
        suggestedWireSize = 2.4;
        reason = 'Kalın TIG kaynağı için - daha iyi akım taşıma';
      } else if (wpsData.thickness <= 20) {
        suggestedWireSize = 3.2;
        reason = 'Çok kalın TIG kaynağı için - yüksek akım kapasitesi';
      } else {
        suggestedWireSize = 4.0;
        reason = 'Ultra kalın TIG kaynağı için - maksimum akım kapasitesi';
      }
    } else if (wpsData.process === 'MMA' || wpsData.process === '111') {
      if (wpsData.thickness <= 3) {
        suggestedWireSize = 2.5;
        reason = 'İnce elektrod kaynağı için minimum çap';
      } else if (wpsData.thickness <= 6) {
        suggestedWireSize = 3.2;
        reason = 'Standart elektrod çapı - en yaygın kullanım';
      } else if (wpsData.thickness <= 12) {
        suggestedWireSize = 4.0;
        reason = 'Kalın malzeme için - yüksek akım kapasitesi';
      } else if (wpsData.thickness <= 20) {
        suggestedWireSize = 5.0;
        reason = 'Çok kalın malzeme için - maksimum akım';
      } else {
        suggestedWireSize = 6.0;
        reason = 'Ultra kalın malzeme için - en yüksek akım kapasitesi';
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

  // 5. Gaz Bileşimi Önerisi (İyileştirilmiş - malzeme ve kalınlığa göre)
  if (wpsData.materialType && wpsData.process && 
      (wpsData.process === 'MIG/MAG' || wpsData.process === 'TIG') && 
      !wpsData.gasComposition) {
    let suggestedGas = '';
    let reason = '';

          if (wpsData.process === 'MIG/MAG') {
        if (wpsData.materialType.includes('Alüminyum')) {
          suggestedGas = '100% Ar (EN ISO 14175: I1)';
          reason = 'Alüminyum için standart - CO2 oksitlenmeye neden olur';
      } else if (wpsData.materialType.includes('Paslanmaz')) {
        if (wpsData.thickness && wpsData.thickness <= 3) {
          suggestedGas = 'Ar + 8% CO2 (EN ISO 14175: M12)';
          reason = 'İnce paslanmaz çelik için - düşük karbon transferi';
        } else {
          suggestedGas = 'Ar + 5% CO2 (EN ISO 14175: M13)';
          reason = 'Kalın paslanmaz çelik için - optimum nüfuziyet';
        }
      } else if (wpsData.materialType.includes('Çelik')) {
        if (wpsData.thickness && wpsData.thickness <= 2) {
          suggestedGas = 'Ar + 8% CO2 (EN ISO 14175: M12)';
          reason = 'Çok ince çelik için - minimum sıçrama, temiz kaynak';
        } else if (wpsData.thickness && wpsData.thickness <= 6) {
          suggestedGas = 'Ar + 18% CO2 (EN ISO 14175: M21)';
          reason = 'Orta kalınlık çelik için - mükemmel denge';
        } else {
          suggestedGas = 'Ar + 18% CO2 (EN ISO 14175: M21)';
          reason = 'Kalın çelik için - yüksek nüfuziyet, ekonomik';
        }
      }
    } else if (wpsData.process === 'TIG') {
      if (wpsData.materialType.includes('Alüminyum')) {
        suggestedGas = '100% Ar (EN ISO 14175: I1)';
        reason = 'Alüminyum TIG için standart - temiz ark, mükemmel kaynak';
      } else if (wpsData.materialType.includes('Paslanmaz')) {
        if (wpsData.thickness && wpsData.thickness > 6) {
          suggestedGas = 'Ar + 2% H2 (EN ISO 14175: I2)';
          reason = 'Kalın paslanmaz TIG için - daha yüksek ısı girdisi';
        } else {
          suggestedGas = '100% Ar (EN ISO 14175: I1)';
          reason = 'Paslanmaz TIG için ideal - temiz, stabil ark';
        }
      } else {
        suggestedGas = '100% Ar (EN ISO 14175: I1)';
        reason = 'TIG kaynağı için universal - mükemmel ark kararlılığı';
      }
    }

    if (suggestedGas) {
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

  // 6. Ağız Açısı Önerisi (Yeni eklenen)
  if (wpsData.grooveType && wpsData.thickness && !wpsData.grooveAngle) {
    let suggestedAngle = 0;
    let reason = '';

    const selectedGroove = GROOVE_TYPES.find(g => g.code === wpsData.grooveType);
    if (selectedGroove) {
      suggestedAngle = selectedGroove.recommendedAngle;
      
      // Kalınlığa göre açı optimizasyonu
      if (wpsData.grooveType === 'V' || wpsData.grooveType === 'DOUBLE_V' || wpsData.grooveType === 'X') {
        if (wpsData.thickness <= 6) {
          suggestedAngle = 60;
          reason = 'İnce-orta malzeme V ağzı için standart açı - optimum erişim';
        } else if (wpsData.thickness <= 15) {
          suggestedAngle = 70;
          reason = 'Kalın malzeme için geniş açı - daha iyi nüfuziyet';
        } else {
          suggestedAngle = 80;
          reason = 'Çok kalın malzeme için maksimum açı - tam nüfuziyet garantisi';
        }
      } else if (wpsData.grooveType === 'U' || wpsData.grooveType === 'DOUBLE_U') {
        if (wpsData.thickness <= 12) {
          suggestedAngle = 15;
          reason = 'Orta kalınlık U ağzı için dar açı - ekonomik';
        } else if (wpsData.thickness <= 25) {
          suggestedAngle = 20;
          reason = 'Kalın U ağzı için standart açı - optimal';
        } else {
          suggestedAngle = 25;
          reason = 'Çok kalın U ağzı için geniş açı - kolay erişim';
        }
      } else if (wpsData.grooveType === 'I' || wpsData.grooveType === 'I_HEAVY') {
        suggestedAngle = 0;
        reason = 'I ağzı için hazırlık gerektirmez - düz kesim';
      } else if (wpsData.grooveType === 'FILLET') {
        suggestedAngle = 90;
        reason = 'Köşe kaynağı için standart dik açı';
      }

      if (suggestedAngle >= 0) {
        recommendations.push({
          parameter: 'grooveAngle',
          value: suggestedAngle,
          min: 0,
          max: 0,
          reason: reason,
          confidence: 'high'
        });
      }
    }
  }
  
  // Mevcut parametrik öneriler (akım, voltaj vb.)
  if (wpsData.wireSize && wpsData.thickness && wpsData.process && wpsData.position) {
    let current = 0;
    let voltage = 0;
    let minCurrent = 0;
    let maxCurrent = 0;
    let minVoltage = 0;
    let maxVoltage = 0;

    if (wpsData.process === 'MIG/MAG') {
      // Doğru MIG parametrelerini kullan
      const migParams = getMigParameters(wpsData.thickness, wpsData.wireSize);
      current = migParams.current;
      voltage = migParams.voltage;
      minCurrent = migParams.minCurrent;
      maxCurrent = migParams.maxCurrent;
      minVoltage = migParams.minVoltage;
      maxVoltage = migParams.maxVoltage;
    } else if (wpsData.process === 'TIG') {
      current = wpsData.wireSize * 80 + wpsData.thickness * 15;
      voltage = 10 + (current - 50) * 0.015;
      minCurrent = Math.round(current * 0.8);
      maxCurrent = Math.round(current * 1.2);
      minVoltage = Math.round((voltage - 1) * 10) / 10;
      maxVoltage = Math.round((voltage + 1) * 10) / 10;
    } else if (wpsData.process === 'MMA' || wpsData.process === '111') {
      current = wpsData.wireSize * 35 + wpsData.thickness * 10;
      voltage = 20 + (current - 80) * 0.025;
      minCurrent = Math.round(current * 0.8);
      maxCurrent = Math.round(current * 1.2);
      minVoltage = Math.round((voltage - 1) * 10) / 10;
      maxVoltage = Math.round((voltage + 1) * 10) / 10;
    }

    // Pozisyon faktörü sadece MIG/MAG dışındakiler için
    if (wpsData.process !== 'MIG/MAG') {
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
      minCurrent = Math.round(current * 0.8);
      maxCurrent = Math.round(current * 1.2);

    switch (wpsData.position) {
      case 'PB': case 'PC': voltage *= 1.05; break;
      case 'PD': voltage *= 1.1; break;
      case '4G': case '6G': voltage *= 1.08; break;
      }
      minVoltage = Math.round(voltage * 0.9 * 10) / 10;
      maxVoltage = Math.round(voltage * 1.1 * 10) / 10;
    }

    recommendations.push({
      parameter: 'current',
      value: Math.round(current),
      min: minCurrent,
      max: maxCurrent,
      reason: wpsData.process === 'MIG/MAG' ? 
        `${wpsData.wireSize}mm tel, ${wpsData.thickness}mm kalınlık için profesyonel tablo değeri` :
        `${wpsData.wireSize}mm tel, ${wpsData.thickness}mm kalınlık için`,
      confidence: 'high'
    });

    recommendations.push({
      parameter: 'voltage',
      value: Math.round(voltage * 10) / 10,
      min: minVoltage,
      max: maxVoltage,
      reason: wpsData.process === 'MIG/MAG' ? 
        `${Math.round(current)}A akım için profesyonel tablo değeri` :
        `${Math.round(current)}A akım için optimum voltaj`,
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
    } else if (wpsData.process === 'MMA' || wpsData.process === '111') {
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



const SectionCard = ({ title, icon, children, step, completed = false }: any) => (
  <Card 
    elevation={4} 
    sx={{ 
      mb: 4, 
      borderRadius: 3,
      overflow: 'hidden',
      border: completed ? '2px solid' : 'none',
      borderColor: completed ? 'success.main' : 'transparent',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 8
      }
    }}
  >
    {/* Modern Section Header */}
    <Box 
      sx={{ 
        background: completed 
          ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
          : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Avatar sx={{ 
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white',
        width: 48,
        height: 48
      }}>
        {completed ? <CheckCircleIcon fontSize="large" /> : icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {step && `${step}. `}{title}
        </Typography>
        {completed && (
          <Chip 
            label="✓ Tamamlandı" 
            size="small"
            sx={{ 
              mt: 1,
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 600
            }}
          />
        )}
      </Box>
    </Box>
    
    {/* Content Area */}
    <CardContent sx={{ p: 4 }}>
      {children}
    </CardContent>
  </Card>
);

const WpsGenerator: React.FC = () => {
  const [wpsData, setWpsData] = useState<Partial<WPSData>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [passData, setPassData] = useState<PassData[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [autoApplyRecommendations, setAutoApplyRecommendations] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);


  useEffect(() => {
    const recs = calculateRecommendations(wpsData);
    setRecommendations(recs);
    
    const passes = calculatePassData(wpsData);
    setPassData(passes);
    if (passes.length > 0) {
      setWpsData(prev => ({ ...prev, passes, passCount: passes.length }));
    }

    // Otomatik öneri uygulama - akıllı güncelleme sistemi
    if (autoApplyRecommendations && recs.length > 0) {
      setTimeout(() => {
        setWpsData(prev => {
          const newData = { ...prev };
          let hasUpdates = false;
          
        recs.forEach(rec => {
            const currentValue = prev[rec.parameter as keyof WPSData];
            // Kritik parametreler: her zaman güncelle (tel çapı ve ağız açısı)
            const criticalParams = ['wireSize', 'grooveAngle'];
            // Teknik parametreler için: boş alanları veya 0 değerleri güncelle
            const technicalParams = ['current', 'voltage', 'gasFlow', 'wireSpeed', 'travelSpeed', 'preheatTemp'];
            // Seçim parametreleri için: sadece boş olanları güncelle
            const selectionParams = ['process', 'position', 'grooveType', 'gasComposition'];
            
            let shouldUpdate = false;
            if (criticalParams.includes(rec.parameter)) {
              // Kritik parametreler: her zaman güncelle
              shouldUpdate = true;
            } else if (technicalParams.includes(rec.parameter)) {
              // Teknik parametreler: boş veya 0 ise güncelle
              shouldUpdate = (!currentValue || currentValue === 0 || currentValue === '');
            } else if (selectionParams.includes(rec.parameter)) {
              // Seçim parametreleri: sadece tamamen boş ise güncelle
              shouldUpdate = (!currentValue || currentValue === '');
            }
            
            if (shouldUpdate) {
            console.log(`Otomatik uygulama: ${rec.parameter} = ${rec.value}`);
              hasUpdates = true;
              
              if (rec.parameter === 'current') newData.current = rec.value as number;
              else if (rec.parameter === 'voltage') newData.voltage = rec.value as number;
              else if (rec.parameter === 'gasFlow') newData.gasFlow = rec.value as number;
              else if (rec.parameter === 'gasComposition') newData.gasComposition = rec.value as string;
              else if (rec.parameter === 'wireSpeed') newData.wireSpeed = rec.value as number;
              else if (rec.parameter === 'travelSpeed') newData.travelSpeed = rec.value as number;
              else if (rec.parameter === 'preheatTemp') newData.preheatTemp = rec.value as number;
              else if (rec.parameter === 'process') newData.process = rec.value as string;
              else if (rec.parameter === 'position') newData.position = rec.value as string;
              else if (rec.parameter === 'wireSize') newData.wireSize = rec.value as number;
              else if (rec.parameter === 'grooveType') newData.grooveType = rec.value as string;
              else if (rec.parameter === 'grooveAngle') newData.grooveAngle = rec.value as number;
            }
          });
          
          return hasUpdates ? newData : prev;
        });
      }, 100); // Kısa gecikme ile state güncellemelerinin çakışmasını önle
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    wpsData.materialType,
    wpsData.materialGroup, 
    wpsData.thickness, 
    wpsData.jointType,
    wpsData.connectionType,
    wpsData.pipeDiameter,
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
      
      // Temel parametreler değiştiğinde teknik parametreleri sıfırla
      const criticalFields = ['thickness', 'materialType', 'materialGroup', 'process'];
      if (criticalFields.includes(field)) {
        // Kalınlık, malzeme türü, kaynak yöntemi değiştiğinde parametreleri sıfırla
        newData.current = 0;
        newData.voltage = 0;
        newData.gasFlow = 0;
        newData.wireSpeed = 0;
        newData.travelSpeed = 0;
        newData.preheatTemp = 0;
        console.log(`Temel parametre değişti (${field}), teknik parametreler sıfırlandı`);
      }
      
      // Kalınlık değiştiğinde tel çapını ve ağız açısını da sıfırla
      if (field === 'thickness') {
        newData.wireSize = 0;
        newData.grooveAngle = 0;
        console.log('Kalınlık değişti, tel çapı ve ağız açısı sıfırlandı');
      }
      
      // Kaynak yöntemi değiştiğinde tel çapını sıfırla
      if (field === 'process') {
        newData.wireSize = 0;
        console.log('Kaynak yöntemi değişti, tel çapı sıfırlandı');
      }
      
      // Kaynak ağzı türü değiştiğinde otomatik olarak önerilen açıyı set et
      if (field === 'grooveType' && value) {
        const selectedGroove = GROOVE_TYPES.find(g => g.code === value);
        if (selectedGroove) {
          // Kalınlığa göre optimize edilmiş ağız açısı
          if (value === 'V' || value === 'DOUBLE_V' || value === 'X') {
            if (newData.thickness <= 6) {
              newData.grooveAngle = 60;
            } else if (newData.thickness <= 15) {
              newData.grooveAngle = 70;
            } else {
              newData.grooveAngle = 80;
            }
          } else if (value === 'U' || value === 'DOUBLE_U') {
            if (newData.thickness <= 12) {
              newData.grooveAngle = 15;
            } else if (newData.thickness <= 25) {
              newData.grooveAngle = 20;
            } else {
              newData.grooveAngle = 25;
            }
          } else {
            newData.grooveAngle = selectedGroove.recommendedAngle;
          }
          
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
    else if (rec.parameter === 'grooveAngle') updateWpsData('grooveAngle', rec.value as number);
  };

  const applyAllRecommendations = () => {
    recommendations.forEach(rec => {
      // Tüm önerileri uygula (dolu alanları da güncelle)
      applyRecommendation(rec);
    });
  };

  const applyEmptyRecommendations = () => {
    recommendations.forEach(rec => {
      // Kritik alanlar (tel çapı, ağız açısı) için her zaman güncelle
      const criticalParams = ['wireSize', 'grooveAngle'];
      const currentValue = wpsData[rec.parameter as keyof WPSData];
      
      if (criticalParams.includes(rec.parameter)) {
        // Kritik parametreler her zaman güncellenir
        applyRecommendation(rec);
      } else if (!currentValue || currentValue === 0 || currentValue === '') {
        // Diğer parametreler sadece boşsa güncellenir
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
    
    (doc as any).autoTable({
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
    
    y += 10;
    
        // Basit PDF oluşturma - tablolar olmadan
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MALZEME BILGILERI', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ana Malzeme Turu: ${wpsData.materialType || 'Belirtilmemis'}`, 20, y); y += 6;
    doc.text(`Malzeme Grubu: ${wpsData.materialGroup || 'Belirtilmemis'}`, 20, y); y += 6;
    doc.text(`Malzeme Kalinligi: ${wpsData.thickness || 0} mm`, 20, y); y += 6;
    
    const jointTypeText = wpsData.jointType === 'BUTT' ? 'Alin Birlestirme' :
          wpsData.jointType === 'FILLET' ? 'Kose Birlestirme' :
          wpsData.jointType === 'LAP' ? 'Bindirme Birlestirme' :
      wpsData.jointType || 'Belirtilmemis';
    doc.text(`Birlestirme Tipi: ${jointTypeText}`, 20, y); y += 6;
    
    const connectionTypeText = wpsData.connectionType === 'PIPE_PIPE' ? 'Boru - Boru' :
      wpsData.connectionType === 'PLATE_PLATE' ? 'Plaka - Plaka' :
      wpsData.connectionType === 'PIPE_PLATE' ? 'Boru - Plaka' :
      wpsData.connectionType || 'Belirtilmemis';
    doc.text(`Baglanti Tipi: ${connectionTypeText}`, 20, y); y += 6;
    
    if (wpsData.pipeDiameter) {
      doc.text(`Boru Capi: ${wpsData.pipeDiameter} mm`, 20, y); y += 6;
    }
    
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('KAYNAK YONTEMI VE PARAMETRELERI', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kaynak Yontemi: ${wpsData.process || 'Belirtilmemis'}`, 20, y); y += 6;
    doc.text(`Kaynak Pozisyonu: ${wpsData.position || 'Belirtilmemis'}`, 20, y); y += 6;
    doc.text(`Tel/Elektrod Capi: ${wpsData.wireSize || 0} mm`, 20, y); y += 6;
    doc.text(`Koruyucu Gaz: ${wpsData.gasComposition || 'Belirtilmemis'}`, 20, y); y += 6;
    doc.text(`Akim Siddeti: ${wpsData.current || 0} A`, 20, y); y += 6;
    doc.text(`Kaynak Voltaji: ${wpsData.voltage || 0} V`, 20, y); y += 6;
    doc.text(`Gaz Debisi: ${wpsData.gasFlow || 0} L/dk`, 20, y); y += 6;
    doc.text(`Tel Hizi: ${wpsData.wireSpeed || 0} m/dk`, 20, y); y += 6;
    doc.text(`Kaynak Hizi: ${wpsData.travelSpeed || 0} mm/dk`, 20, y); y += 6;
    doc.text(`On Isitma Sicakligi: ${wpsData.preheatTemp || 0} C`, 20, y); y += 6;
    
    if (wpsData.passes && wpsData.passes.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PASO BAZLI PARAMETRELER', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      wpsData.passes.forEach((pass, index) => {
        const passTypeText = pass.passType === 'root' ? 'Kok' : pass.passType === 'fill' ? 'Ara' : 'Kapak';
        doc.text(`${pass.passNumber}. Paso (${passTypeText}): ${pass.current}A, ${pass.voltage}V`, 20, y);
        y += 6;
      });
    }

    if (wpsData.grooveType) {
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('KAYNAK AGZI BILGILERI', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const grooveTypeText = wpsData.grooveType === 'I' ? 'I Kaynak Agzi (Ince)' :
          wpsData.grooveType === 'I_HEAVY' ? 'I Kaynak Agzi (Kalin)' :
          wpsData.grooveType === 'V' ? 'V Agzi' :
          wpsData.grooveType === 'U' ? 'U Agzi' :
          wpsData.grooveType === 'X' ? 'X Agzi (Cift V Simetrik)' :
        wpsData.grooveType || 'Belirtilmemis';
        
      doc.text(`Agiz Turu: ${grooveTypeText}`, 20, y); y += 6;
      doc.text(`Agiz Acisi: ${wpsData.grooveAngle || 0} derece`, 20, y); y += 6;
      doc.text(`Kok Acikligi: ${wpsData.rootOpening || 0} mm`, 20, y); y += 6;
      doc.text(`Toplam Paso Sayisi: ${wpsData.passCount || 0} paso`, 20, y); y += 6;
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
      alert('Lütfen tüm zorunlu alanları doldurun: Malzeme Türü, Kalınlık, Birleştirme Tipi, Kaynak Yöntemi');
      return;
    }
    
    // PDF oluştur
    generateEnhancedPDF();
  };

  const getFilteredSizes = () => {
    return wpsData.process ? WIRE_SIZES[wpsData.process as keyof typeof WIRE_SIZES] || [] : [];
  };

  const getFilteredGases = () => {
    return wpsData.process ? GAS_COMPOSITIONS[wpsData.process as keyof typeof GAS_COMPOSITIONS] || [] : [];
  };

  const getCompletionStatus = () => {
    const requiredFields = ['materialType', 'thickness', 'jointType', 'process'];
    const completed = requiredFields.filter(field => wpsData[field as keyof WPSData]).length;
    return { completed, total: requiredFields.length, percentage: (completed / requiredFields.length) * 100 };
  };

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 0: return wpsData.materialType && wpsData.thickness && wpsData.jointType;
      case 1: return wpsData.process && wpsData.position;
      case 2: return wpsData.grooveType;
      case 3: return wpsData.current && wpsData.voltage;
      default: return false;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Modern Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            {/* Başlık ve Progress */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                WPS Oluşturucu
              </Typography>
              <Box sx={{ mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getCompletionStatus().percentage}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white'
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                İlerleme: {getCompletionStatus().completed}/{getCompletionStatus().total} adım tamamlandı 
                ({Math.round(getCompletionStatus().percentage)}%)
              </Typography>
            </Grid>

            {/* Kontrol Butonları */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Üst Sıra */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>

                </Box>

                {/* Alt Sıra */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={showRecommendations} 
                        onChange={(e) => setShowRecommendations(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'white',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(255,255,255,0.5)',
                          },
                        }}
                      />
                    }
                    label="Akıllı Öneriler"
                    sx={{ color: 'white', mr: 2 }}
                  />
                  

                  
                  <Button 
                    variant="contained" 
                    startIcon={<PdfIcon />} 
                    onClick={createWPS}
                    disabled={getCompletionStatus().percentage < 100}
                    sx={{ 
                      backgroundColor: 'white', 
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.9)' 
                      }
                    }}
                  >
                    WPS Oluştur
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
        {/* Main Form */}
          <Grid item xs={12} lg={showRecommendations ? 8 : 12}>
            <Box>
              {/* Step 1: Material and Joint Information */}
              <SectionCard 
                title="Malzeme ve Birleştirme Bilgileri" 
                icon={<BusinessIcon />}
                step={1}
                completed={isStepCompleted(0)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Malzeme Türü</InputLabel>
                      <Select 
                        value={wpsData.materialType || ''} 
                        onChange={(e) => updateWpsData('materialType', e.target.value)}
                      >
                      {MATERIAL_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                  </Grid>

                  <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                      label="Kalınlık (mm)"
                    type="number"
                      required
                    value={wpsData.thickness || ''}
                    onChange={(e) => updateWpsData('thickness', parseFloat(e.target.value) || 0)}
                    helperText="Kaynak edilecek malzeme kalınlığı"
                  />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                      Birleştirme Tipi Seçimi
                    </Typography>
                    <Grid container spacing={2}>
                      {JOINT_TYPES.map((joint) => (
                        <Grid item xs={12} sm={6} md={3} key={joint.code}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              border: 2,
                              borderColor: wpsData.jointType === joint.code ? 'primary.main' : 'grey.300',
                              backgroundColor: wpsData.jointType === joint.code ? 'primary.50' : 'background.paper',
                              height: '100%',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                borderColor: 'primary.main', 
                                backgroundColor: 'primary.50',
                                transform: 'translateY(-2px)',
                                boxShadow: 4
                              }
                            }}
                            onClick={() => updateWpsData('jointType', joint.code)}
                          >
                            <CardContent>
                              <Typography variant="h4" sx={{ textAlign: 'center', mb: 1, fontFamily: 'monospace' }}>
                                {joint.icon}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom textAlign="center">
                                {joint.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                                {joint.description}
                              </Typography>
            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Yeni: Birleştirme Tipi (Boru/Plaka) */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                      Bağlantı Tipi
                    </Typography>
                    <Grid container spacing={2}>
                      {CONNECTION_TYPES.map((connection) => (
                        <Grid item xs={12} sm={4} key={connection.code}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              border: 2,
                              borderColor: wpsData.connectionType === connection.code ? 'info.main' : 'grey.300',
                              backgroundColor: wpsData.connectionType === connection.code ? 'info.50' : 'background.paper',
                              height: '100%',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                borderColor: 'info.main', 
                                backgroundColor: 'info.50',
                                transform: 'translateY(-2px)',
                                boxShadow: 4
                              }
                            }}
                            onClick={() => updateWpsData('connectionType', connection.code)}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ mb: 1 }}>
                                {connection.icon}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                {connection.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {connection.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Yeni: Boru Çapı (sadece boru içeren bağlantılarda) */}
                  {wpsData.connectionType && CONNECTION_TYPES.find(c => c.code === wpsData.connectionType)?.needsDiameter && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Çap (mm)"
                        type="number"
                        required
                        value={wpsData.pipeDiameter || ''}
                        onChange={(e) => updateWpsData('pipeDiameter', parseFloat(e.target.value) || 0)}
                        helperText="Kaynak edilecek borunun dış çapı"
                      />
                    </Grid>
                  )}
                </Grid>
              </SectionCard>

              {/* Step 2: Welding Method and Position */}
              <SectionCard 
                title="Kaynak Yöntemi ve Pozisyon" 
                icon={<BuildIcon />}
                step={2}
                completed={isStepCompleted(1)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Kaynak Yöntemi</InputLabel>
                    <Select value={wpsData.process || ''} onChange={(e) => updateWpsData('process', e.target.value)}>
                      {WELDING_PROCESSES.map(process => (
                        <MenuItem key={process.code} value={process.code}>{process.name}</MenuItem>
                      ))}
                    </Select>
                      <FormHelperText>Malzeme türüne uygun kaynak yöntemini seçin</FormHelperText>
                  </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                    <InputLabel>Kaynak Pozisyonu</InputLabel>
                    <Select value={wpsData.position || ''} onChange={(e) => updateWpsData('position', e.target.value)}>
                        {WELDING_POSITIONS.map(pos => (
                          <MenuItem key={pos.code} value={pos.code}>{pos.name}</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>EN ISO 6947 standardına uygun pozisyonlar</FormHelperText>
                  </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tel/Elektrod Çapı</InputLabel>
                    <Select 
                      value={wpsData.wireSize || ''} 
                      onChange={(e) => updateWpsData('wireSize', Number(e.target.value))}
                      disabled={!wpsData.process}
                    >
                        {(wpsData.process ? WIRE_SIZES[wpsData.process as keyof typeof WIRE_SIZES] || [] : []).map(size => (
                          <MenuItem key={size} value={size}>{size} mm</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {wpsData.process ? `${wpsData.process} için standart çaplar` : 'Önce kaynak yöntemini seçin'}
                    </FormHelperText>
                  </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gaz Bileşimi</InputLabel>
                    <Select 
                      value={wpsData.gasComposition || ''} 
                      onChange={(e) => updateWpsData('gasComposition', e.target.value)}
                      disabled={!wpsData.process}
                    >
                        {(wpsData.process ? GAS_COMPOSITIONS[wpsData.process as keyof typeof GAS_COMPOSITIONS] || [] : []).map(gas => (
                        <MenuItem key={gas} value={gas}>{gas}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {wpsData.process === 'MMA' ? 'El arkı kaynağı gaz kullanmaz' : 
                       wpsData.process ? `${wpsData.process} için EN 14175 standart gazları` : 
                       'Önce kaynak yöntemini seçin'}
                    </FormHelperText>
                  </FormControl>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Step 3: Groove Design */}
              <SectionCard 
                title="Kaynak Ağzı Tasarımı" 
                icon={<ConstructionIcon />}
                step={3}
                completed={isStepCompleted(2)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth>
                    <InputLabel>Kaynak Ağzı Türü</InputLabel>
                      <Select 
                        value={wpsData.grooveType || ''} 
                        onChange={(e) => updateWpsData('grooveType', e.target.value)}
                        disabled={!wpsData.jointType}
                      >
                      {GROOVE_TYPES.filter(groove => 
                        groove.jointTypes.includes(wpsData.jointType || '') &&
                        (!wpsData.thickness || 
                         (wpsData.thickness >= groove.minThickness && wpsData.thickness <= groove.maxThickness))
                      ).map(groove => (
                        <MenuItem key={groove.code} value={groove.code}>
                            <Box>
                              <Typography variant="body1" fontWeight="500">{groove.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {groove.minThickness}-{groove.maxThickness}mm | {groove.description}
                              </Typography>
                            </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Ağız Açısı"
                    type="number"
                    value={wpsData.grooveAngle || ''}
                    onChange={(e) => updateWpsData('grooveAngle', parseFloat(e.target.value) || 0)}
                    InputProps={{ endAdornment: <InputAdornment position="end">°</InputAdornment> }}
                    helperText={
                      wpsData.grooveType ? 
                          `Önerilen: ${GROOVE_TYPES.find(g => g.code === wpsData.grooveType)?.recommendedAngle}°` :
                        'Önce kaynak ağzı türünü seçin'
                    }
                  />
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Step 4: Welding Parameters */}
              <SectionCard 
                title="Kaynak Parametreleri" 
                icon={<TuneIcon />}
                step={4}
                completed={isStepCompleted(3)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Akım"
                    type="number"
                    value={wpsData.current || ''}
                    onChange={(e) => updateWpsData('current', parseFloat(e.target.value) || 0)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">A</InputAdornment>
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Voltaj"
                    type="number"
                    value={wpsData.voltage || ''}
                    onChange={(e) => updateWpsData('voltage', parseFloat(e.target.value) || 0)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">V</InputAdornment>
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Gaz Debisi"
                    type="number"
                    value={wpsData.gasFlow || ''}
                    onChange={(e) => updateWpsData('gasFlow', parseFloat(e.target.value) || 0)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">L/dk</InputAdornment>
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Ön Isıtma"
                    type="number"
                    value={wpsData.preheatTemp || ''}
                    onChange={(e) => updateWpsData('preheatTemp', parseFloat(e.target.value) || 0)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">°C</InputAdornment>
                      }}
                    />
                  </Grid>
                </Grid>
              </SectionCard>
                </Box>
          </Grid>

        {/* Modern Recommendations Panel */}
        {showRecommendations && (
            <Grid item xs={12} lg={4}>
                             <Card 
                 elevation={6} 
                 sx={{ 
                   position: 'sticky', 
                   top: 24,
                   borderRadius: 3,
                   overflow: 'hidden',
                   border: '1px solid',
                   borderColor: 'primary.light'
                 }}
               >
                                 {/* Header */}
                 <Box 
                   sx={{ 
                     background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                     color: 'white',
                     p: 3,
                     display: 'flex',
                     alignItems: 'center',
                     gap: 2
                   }}
                 >
                  <Avatar sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    width: 48,
                    height: 48
                  }}>
                    <RecommendIcon fontSize="large" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={700}>
                      Akıllı Öneriler
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      EN ISO 15609-1 standartları
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {recommendations.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Öneriler için malzeme ve kaynak yöntemi bilgilerini doldurun
                    </Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={applyAllRecommendations}
                        startIcon={<CheckCircleIcon />}
                        fullWidth
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          py: 1.5,
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
                        }}
                      >
                        Tümünü Uygula ({recommendations.length})
                      </Button>
                      
                    {recommendations.map((rec, index) => (
                        <Card 
                          key={index} 
                          variant="outlined" 
                          sx={{ 
                            p: 2.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'primary.50',
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                         <Typography variant="subtitle2" fontWeight={600} color="primary">
                              {rec.parameter === 'current' && 'Akım (A)'}
                              {rec.parameter === 'voltage' && 'Voltaj (V)'}
                              {rec.parameter === 'gasFlow' && 'Gaz Debisi (L/dk)'}
                              {rec.parameter === 'gasComposition' && 'Gaz Bileşimi'}
                              {rec.parameter === 'wireSpeed' && 'Tel Hızı (m/dk)'}
                              {rec.parameter === 'travelSpeed' && 'Kaynak Hızı (mm/dk)'}
                              {rec.parameter === 'preheatTemp' && 'Ön Isıtma (°C)'}
                              {rec.parameter === 'process' && 'Kaynak Yöntemi'}
                              {rec.parameter === 'position' && 'Kaynak Pozisyonu'}
                              {rec.parameter === 'wireSize' && 'Tel Çapı (mm)'}
                              {rec.parameter === 'grooveType' && 'Kaynak Ağzı Türü'}
                              {rec.parameter === 'grooveAngle' && 'Ağız Açısı (°)'}
                            </Typography>
                            <Chip 
                              label={rec.confidence === 'high' ? 'Yüksek' : rec.confidence === 'medium' ? 'Orta' : 'Düşük'} 
                              size="small"
                              color={rec.confidence === 'high' ? 'success' : rec.confidence === 'medium' ? 'warning' : 'default'}
                            />
                          </Box>
                          
                          <Typography variant="h6" color="primary" fontWeight={700} sx={{ mb: 1.5 }}>
                            {typeof rec.value === 'number' ? rec.value : rec.value}
                            {rec.min > 0 && ` (${rec.min}–${rec.max})`}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {rec.reason}
                          </Typography>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyRecommendation(rec)}
                            startIcon={<CheckCircleIcon />}
                            fullWidth
                            sx={{ 
                              borderRadius: 2,
                              fontWeight: 600
                            }}
                          >
                            Uygula
                          </Button>
                        </Card>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            )}
        </Grid>
      </Container>

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
                  <TableCell>{wpsData.thickness} mm</TableCell>
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
          <Button variant="contained" startIcon={<PdfIcon />} onClick={() => {/* generateEnhancedPDF */}}>PDF İndir</Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default WpsGenerator; 