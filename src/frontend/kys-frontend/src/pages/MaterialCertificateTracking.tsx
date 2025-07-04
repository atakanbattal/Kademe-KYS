import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as CertificateIcon,
  Search as SearchIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Material Standards Database
interface MaterialStandard {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  grade: string;
  standard: string;
  chemicalComposition: {
    element: string;
    minValue: number;
    maxValue: number;
    typical?: number;
  }[];
  mechanicalProperties: {
    property: string;
    minValue: number;
    maxValue: number;
    unit: string;
    testMethod: string;
    typical?: number;
  }[];
  hardnessRequirements: {
    type: string;
    minValue: number;
    maxValue: number;
    testPosition: string;
    typical?: number;
  }[];
}

interface MaterialCategory {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    grades: {
      id: string;
      name: string;
      standards: string[];
    }[];
  }[];
}

// Interfaces
interface ChemicalComposition {
  element: string;
  percentage: number;
  specification: string;
  minValue: number;
  maxValue: number;
  status: 'KABUL' | 'RET' | 'UYARI' | 'BEKLEMEDE';
}

interface HardnessValue {
  type: string; // HRC, HRB, HV, etc.
  value: number;
  specification: string;
  minValue: number;
  maxValue: number;
  testPosition: string;
  status: 'KABUL' | 'RET' | 'UYARI' | 'BEKLEMEDE';
}

interface MechanicalProperty {
  property: string; // Tensile Strength, Yield Strength, Elongation, etc.
  value: number;
  unit: string;
  specification: string;
  minValue: number;
  maxValue: number;
  testMethod: string;
  status: 'KABUL' | 'RET' | 'UYARI' | 'BEKLEMEDE';
}

interface Certificate {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  size: number;
  url: string;
}

interface MaterialRecord {
  id: string;
  materialCode: string;
  materialName: string;
  supplier: string;
  partNumber: string; // NEW: Parça numarası alanı
  packageNumber: string; // NEW: Paket numarası alanı
  castNumber: string; // NEW: Döküm numarası alanı
  certificateNumber: string; // NEW: Sertifika numarası alanı
  certificateStandard: string; // NEW: Sertifika normu alanı (3.1/3.2)
  certificateDate: string; // NEW: Sertifika tarihi alanı
  batchNumber: string;
  receivedDate: string;
  quantity: number;
  unit: string;
  standard: string;
  grade: string;
  chemicalComposition: ChemicalComposition[];
  hardnessValues: HardnessValue[];
  mechanicalProperties: MechanicalProperty[];
  certificates: Certificate[];
  overallStatus: 'ONAYLANMIS' | 'RETEDİLDİ' | 'BEKLEMEDE' | 'ŞARTLI';
  notes: string;
  inspector: string;
  inspectionDate: string;
  traceabilityNumber: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Material Standards Database
const materialCategories: MaterialCategory[] = [
  {
    id: 'steel',
    name: 'Çelik',
    subCategories: [
      {
        id: 'structural_steel',
        name: 'Yapısal Çelik',
        grades: [
          { id: 's235jr', name: 'S235JR', standards: ['DIN EN 10025-2'] },
          { id: 's235j0', name: 'S235J0', standards: ['DIN EN 10025-2'] },
          { id: 's235j2', name: 'S235J2', standards: ['DIN EN 10025-2'] },
          { id: 's275jr', name: 'S275JR', standards: ['DIN EN 10025-2'] },
          { id: 's275j0', name: 'S275J0', standards: ['DIN EN 10025-2'] },
          { id: 's275j2', name: 'S275J2', standards: ['DIN EN 10025-2'] },
          { id: 's355jr', name: 'S355JR', standards: ['DIN EN 10025-2'] },
          { id: 's355j0', name: 'S355J0', standards: ['DIN EN 10025-2'] },
          { id: 's355k2', name: 'S355K2', standards: ['DIN EN 10025-2'] }
        ]
      },
      {
        id: 'tool_steel',
        name: 'Takım Çeliği',
        grades: [
          { id: '1.2312', name: '1.2312 (P20)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2344', name: '1.2344 (H13)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2379', name: '1.2379 (D2)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2767', name: '1.2767 (A2)', standards: ['DIN EN ISO 4957'] }
        ]
      },
      {
        id: 'spring_steel',
        name: 'Yay Çeliği',
        grades: [
          { id: '38si7', name: '38Si7', standards: ['DIN EN 10089'] },
          { id: '50crv4', name: '50CrV4', standards: ['DIN EN 10089'] },
          { id: '60si7', name: '60Si7', standards: ['DIN EN 10089'] }
        ]
      }
    ]
  },
  {
    id: 'stainless',
    name: 'Paslanmaz Çelik',
    subCategories: [
              {
          id: 'austenitic',
          name: 'Östenitik',
          grades: [
            { id: '304', name: '304 (X5CrNi18-10)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '304l', name: '304L (X2CrNi19-11)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '316', name: '316 (X5CrNiMo17-12-2)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
          { id: '316l', name: '316L (X2CrNiMo17-12-2)', standards: ['DIN EN 10088-2', 'ASTM A240'] }
          ]
        }
    ]
  },
  {
    id: 'aluminum',
    name: 'Alüminyum',
    subCategories: [
      {
        id: 'al_1000',
        name: '1000 Serisi (Saf Al)',
        grades: [
          { id: '1050', name: '1050', standards: ['DIN EN 573-3', 'ASTM B209'] },
          { id: '1060', name: '1060', standards: ['DIN EN 573-3', 'ASTM B209'] },
          { id: '1070', name: '1070', standards: ['DIN EN 573-3', 'ASTM B209'] }
        ]
      },
      {
        id: 'al_6000',
        name: '6000 Serisi (Al-Mg-Si)',
        grades: [
          { id: '6061', name: '6061', standards: ['DIN EN 573-3', 'ASTM B221'] },
          { id: '6063', name: '6063', standards: ['DIN EN 573-3', 'ASTM B221'] },
          { id: '6082', name: '6082', standards: ['DIN EN 573-3', 'ASTM B221'] }
        ]
      }
    ]
  }
];

// Context7 Enhanced Material Standards Database - Extended for comprehensive coverage
const materialStandards: MaterialStandard[] = [
  {
    id: 's355j2_din_10025_2',
    name: 'S355J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Çentik Darbe (Charpy V) -40°C', minValue: 20, maxValue: 45, unit: 'J', testMethod: 'ISO 148-1 (-40°C)', typical: 28 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  {
    id: 's235jr_din_10025_2',
    name: 'S235JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 35, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 45 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  {
    id: 's275n_din_10025_3',
    name: 'S275N - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275n',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.18, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.50, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 1.50, typical: 0.95 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 390, maxValue: 540, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 465 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 395, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 26 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Çentik Darbe (Charpy V) -50°C', minValue: 20, maxValue: 45, unit: 'J', testMethod: 'ISO 148-1 (-50°C)', typical: 28 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 180, testPosition: 'Yüzey', typical: 155 }
    ]
  },
  {
    id: 's355j2_din_10025_3',
    name: 'S355J2 - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j2',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.20, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  {
    id: 's460n_din_10025_3',
    name: 'S460N - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's460n',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.20, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.60, typical: 0.30 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.70, typical: 1.35 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 540, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 630 },
      { property: 'Akma Dayanımı', minValue: 460, maxValue: 580, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 520 },
      { property: 'Uzama', minValue: 17, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 210, testPosition: 'Yüzey', typical: 180 }
    ]
  },
  {
    id: '42crmo4_din_10083_3',
    name: '42CrMo4 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '42crmo4',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.38, maxValue: 0.45, typical: 0.42 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.60, maxValue: 0.90, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1100 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 950, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 14, maxValue: 20, unit: '%', testMethod: 'ISO 6892-1', typical: 16 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 70, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 85 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 60, maxValue: 100, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 75 },
      { property: 'Çentik Darbe (Charpy V) -40°C', minValue: 45, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-40°C)', typical: 60 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 },
      { property: 'Kırılma Tokluğu', minValue: 80, maxValue: 120, unit: 'MPa√m', testMethod: 'ASTM E399', typical: 100 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 28, maxValue: 35, testPosition: 'Çekirdek', typical: 32 },
      { type: 'HB', minValue: 270, maxValue: 330, testPosition: 'Yüzey', typical: 300 }
    ]
  },
  {
    id: '304_din_10088_2',
    name: '304 (X5CrNi18-10) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 17.50, maxValue: 19.50, typical: 18.50 },
      { element: 'Ni', minValue: 8.00, maxValue: 10.50, typical: 9.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Çentik Darbe (Charpy V) -196°C', minValue: 120, maxValue: 200, unit: 'J', testMethod: 'ISO 148-1 (-196°C)', typical: 150 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 },
      { property: 'Aşınma Direnci', minValue: 200, maxValue: 300, unit: 'HV', testMethod: 'ASTM G99', typical: 250 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 },
      { type: 'HRC', minValue: 0, maxValue: 25, testPosition: 'Yüzey', typical: 15 }
    ]
  },
  {
    id: '316l_din_10088_2',
    name: '316L (X2CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.030, typical: 0.020 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 620, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 170, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 220 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 180, maxValue: 280, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 220 },
      { property: 'Çentik Darbe (Charpy V) -196°C', minValue: 100, maxValue: 180, unit: 'J', testMethod: 'ISO 148-1 (-196°C)', typical: 140 },
      { property: 'Korozyon Direnci', minValue: 24, maxValue: 72, unit: 'saat', testMethod: 'ASTM A262', typical: 48 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  {
    id: '6061_astm_b211',
    name: '6061 - ASTM B211',
    category: 'aluminum',
    subCategory: 'al_6000',
    grade: '6061',
    standard: 'ASTM B211',
    chemicalComposition: [
      { element: 'Si', minValue: 0.40, maxValue: 0.80, typical: 0.60 },
      { element: 'Fe', minValue: 0, maxValue: 0.70, typical: 0.35 },
      { element: 'Cu', minValue: 0.15, maxValue: 0.40, typical: 0.28 },
      { element: 'Mn', minValue: 0, maxValue: 0.15, typical: 0.08 },
      { element: 'Mg', minValue: 0.80, maxValue: 1.20, typical: 1.00 },
      { element: 'Cr', minValue: 0.04, maxValue: 0.35, typical: 0.20 },
      { element: 'Zn', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Ti', minValue: 0, maxValue: 0.15, typical: 0.07 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 290, maxValue: 330, unit: 'MPa', testMethod: 'ASTM B557', typical: 310 },
      { property: 'Akma Dayanımı', minValue: 240, maxValue: 280, unit: 'MPa', testMethod: 'ASTM B557', typical: 260 },
      { property: 'Uzama', minValue: 8, maxValue: 17, unit: '%', testMethod: 'ASTM B557', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 20, maxValue: 35, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -40°C', minValue: 15, maxValue: 25, unit: 'J', testMethod: 'ASTM E23 (-40°C)', typical: 18 },
      { property: 'Elastisite Modülü', minValue: 68, maxValue: 72, unit: 'GPa', testMethod: 'ASTM E111', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 90, maxValue: 110, unit: 'MPa', testMethod: 'ASTM D7791', typical: 100 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 90, maxValue: 110, testPosition: 'Yüzey', typical: 100 }
    ]
  },
  {
    id: 'ti6al4v_astm_b265',
    name: 'Ti-6Al-4V (Grade 5) - ASTM B265',
    category: 'titanium',
    subCategory: 'ti_alloy',
    grade: 'ti6al4v',
    standard: 'ASTM B265',
    chemicalComposition: [
      { element: 'Al', minValue: 5.50, maxValue: 6.75, typical: 6.10 },
      { element: 'V', minValue: 3.50, maxValue: 4.50, typical: 4.00 },
      { element: 'Fe', minValue: 0, maxValue: 0.30, typical: 0.15 },
      { element: 'O', minValue: 0, maxValue: 0.20, typical: 0.10 },
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.04 },
      { element: 'N', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'H', minValue: 0, maxValue: 0.015, typical: 0.008 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 895, maxValue: 1050, unit: 'MPa', testMethod: 'ASTM E8', typical: 950 },
      { property: 'Akma Dayanımı', minValue: 825, maxValue: 950, unit: 'MPa', testMethod: 'ASTM E8', typical: 880 },
      { property: 'Uzama', minValue: 10, maxValue: 18, unit: '%', testMethod: 'ASTM E8', typical: 14 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 20, maxValue: 40, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -54°C', minValue: 15, maxValue: 30, unit: 'J', testMethod: 'ASTM E23 (-54°C)', typical: 22 },
      { property: 'Elastisite Modülü', minValue: 110, maxValue: 120, unit: 'GPa', testMethod: 'ASTM E111', typical: 114 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ASTM D7791', typical: 450 },
      { property: 'Kırılma Tokluğu', minValue: 50, maxValue: 80, unit: 'MPa√m', testMethod: 'ASTM E399', typical: 65 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 32, maxValue: 38, testPosition: 'Yüzey', typical: 35 }
    ]
  },
  
  // === YAPISAL ÇELİKLER (STRUCTURAL STEEL) - KAPSAMLI VERİ TABANI ===
  
  // S275JR - DIN EN 10025-2
  {
    id: 's275jr_din_10025_2',
    name: 'S275JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JO - DIN EN 10025-2
  {
    id: 's355jo_din_10025_2',
    name: 'S355JO - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jo',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-3
  {
    id: 's355k2_din_10025_3',
    name: 'S355K2 - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.18, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0.50, maxValue: 1.60, typical: 1.05 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 55 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S420N - DIN EN 10025-3
  {
    id: 's420n_din_10025_3',
    name: 'S420N - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's420n',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.20, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.60, typical: 0.30 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.70, typical: 1.35 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 520, maxValue: 680, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 600 },
      { property: 'Akma Dayanımı', minValue: 420, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 490 },
      { property: 'Uzama', minValue: 19, maxValue: 30, unit: '%', testMethod: 'ISO 6892-1', typical: 22 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 55 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 145, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // S460M - DIN EN 10025-4
  {
    id: 's460m_din_10025_4',
    name: 'S460M - DIN EN 10025-4',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's460m',
    standard: 'DIN EN 10025-4',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.12, typical: 0.08 },
      { element: 'Si', minValue: 0, maxValue: 0.80, typical: 0.40 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.70, typical: 1.35 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'N', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 540, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 630 },
      { property: 'Akma Dayanımı', minValue: 460, maxValue: 580, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 520 },
      { property: 'Uzama', minValue: 17, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 55 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 210, testPosition: 'Yüzey', typical: 180 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER (ALLOY STEEL) - KAPSAMLI VERİ TABANI ===
  
  // 34CrMo4 - DIN EN 10083-3
  {
    id: '34crmo4_din_10083_3',
    name: '34CrMo4 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '34crmo4',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.30, maxValue: 0.37, typical: 0.34 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.60, maxValue: 0.90, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1100, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1000 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 850, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 16, maxValue: 22, unit: '%', testMethod: 'ISO 6892-1', typical: 18 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 80, maxValue: 130, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 100 },
      { property: 'Yorulma Dayanımı', minValue: 420, maxValue: 520, unit: 'MPa', testMethod: 'ISO 1099', typical: 470 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 25, maxValue: 32, testPosition: 'Çekirdek', typical: 29 },
      { type: 'HB', minValue: 250, maxValue: 310, testPosition: 'Yüzey', typical: 280 }
    ]
  },
  
  // 25CrMo4 - DIN EN 10083-3
  {
    id: '25crmo4_din_10083_3',
    name: '25CrMo4 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '25crmo4',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.22, maxValue: 0.29, typical: 0.25 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.60, maxValue: 0.90, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Akma Dayanımı', minValue: 600, maxValue: 750, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 700 },
      { property: 'Uzama', minValue: 18, maxValue: 25, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 90, maxValue: 140, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 115 },
      { property: 'Yorulma Dayanımı', minValue: 380, maxValue: 480, unit: 'MPa', testMethod: 'ISO 1099', typical: 430 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 22, maxValue: 28, testPosition: 'Çekirdek', typical: 25 },
      { type: 'HB', minValue: 220, maxValue: 280, testPosition: 'Yüzey', typical: 250 }
    ]
  },
  
  // 30CrNiMo8 - DIN EN 10083-3
  {
    id: '30crnimo8_din_10083_3',
    name: '30CrNiMo8 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '30crnimo8',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.26, maxValue: 0.34, typical: 0.30 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.30, maxValue: 0.60, typical: 0.45 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.80, maxValue: 2.20, typical: 2.00 },
      { element: 'Ni', minValue: 1.80, maxValue: 2.20, typical: 2.00 },
      { element: 'Mo', minValue: 0.30, maxValue: 0.50, typical: 0.40 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1100, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1200 },
      { property: 'Akma Dayanımı', minValue: 900, maxValue: 1100, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1000 },
      { property: 'Uzama', minValue: 12, maxValue: 18, unit: '%', testMethod: 'ISO 6892-1', typical: 15 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 100, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 80 },
      { property: 'Yorulma Dayanımı', minValue: 500, maxValue: 600, unit: 'MPa', testMethod: 'ISO 1099', typical: 550 },
      { property: 'Kırılma Tokluğu', minValue: 70, maxValue: 110, unit: 'MPa√m', testMethod: 'ASTM E399', typical: 90 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 32, maxValue: 39, testPosition: 'Çekirdek', typical: 36 },
      { type: 'HB', minValue: 300, maxValue: 370, testPosition: 'Yüzey', typical: 335 }
    ]
  },
  
  // === TAKIM ÇELİKLERİ (TOOL STEEL) - KAPSAMLI VERİ TABANI ===
  
  {
    id: '1.2379_din_4957',
    name: '1.2379 (D2) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2379',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 1.45, maxValue: 1.60, typical: 1.52 },
      { element: 'Si', minValue: 0.15, maxValue: 0.60, typical: 0.35 },
      { element: 'Mn', minValue: 0.20, maxValue: 0.60, typical: 0.40 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 11.00, maxValue: 13.00, typical: 12.00 },
      { element: 'Mo', minValue: 0.70, maxValue: 1.20, typical: 0.95 },
      { element: 'V', minValue: 0.50, maxValue: 1.10, typical: 0.80 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1800, maxValue: 2200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 2000 },
      { property: 'Akma Dayanımı', minValue: 1600, maxValue: 1900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1750 },
      { property: 'Uzama', minValue: 5, maxValue: 12, unit: '%', testMethod: 'ISO 6892-1', typical: 8 },
      { property: 'Aşınma Direnci', minValue: 60, maxValue: 65, unit: 'HRC', testMethod: 'ASTM A681', typical: 62 },
      { property: 'Basma Dayanımı', minValue: 2800, maxValue: 3200, unit: 'MPa', testMethod: 'ASTM E9', typical: 3000 },
      { property: 'Yorulma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 1099', typical: 900 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 }
    ]
  },
  
  // 1.2343 (H11) - DIN EN ISO 4957
  {
    id: '1.2343_din_4957',
    name: '1.2343 (H11) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2343',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 0.33, maxValue: 0.41, typical: 0.37 },
      { element: 'Si', minValue: 0.80, maxValue: 1.20, typical: 1.00 },
      { element: 'Mn', minValue: 0.25, maxValue: 0.50, typical: 0.38 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 4.80, maxValue: 5.50, typical: 5.15 },
      { element: 'Mo', minValue: 1.10, maxValue: 1.50, typical: 1.30 },
      { element: 'V', minValue: 0.30, maxValue: 0.50, typical: 0.40 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1200, maxValue: 1500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1350 },
      { property: 'Akma Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Uzama', minValue: 8, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 20, maxValue: 40, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 30 },
      { property: 'Sıcaklık Direnci', minValue: 550, maxValue: 600, unit: '°C', testMethod: 'DIN EN ISO 4957', typical: 575 },
      { property: 'Termal Şok Direnci', minValue: 400, maxValue: 500, unit: '°C', testMethod: 'DIN EN ISO 4957', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 38, maxValue: 44, testPosition: 'Yüzey', typical: 41 }
    ]
  },
  
  // 1.2367 (H10) - DIN EN ISO 4957
  {
    id: '1.2367_din_4957',
    name: '1.2367 (H10) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2367',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 0.35, maxValue: 0.42, typical: 0.39 },
      { element: 'Si', minValue: 0.80, maxValue: 1.20, typical: 1.00 },
      { element: 'Mn', minValue: 0.25, maxValue: 0.50, typical: 0.38 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 3.00, maxValue: 3.75, typical: 3.38 },
      { element: 'Mo', minValue: 2.20, maxValue: 3.20, typical: 2.70 },
      { element: 'V', minValue: 0.30, maxValue: 0.60, typical: 0.45 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1300, maxValue: 1600, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1450 },
      { property: 'Akma Dayanımı', minValue: 1100, maxValue: 1400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1250 },
      { property: 'Uzama', minValue: 7, maxValue: 14, unit: '%', testMethod: 'ISO 6892-1', typical: 10 },
      { property: 'Sıcaklık Direnci', minValue: 580, maxValue: 630, unit: '°C', testMethod: 'DIN EN ISO 4957', typical: 605 },
      { property: 'Termal Kondüktivite', minValue: 25, maxValue: 30, unit: 'W/mK', testMethod: 'ISO 22007', typical: 27 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 40, maxValue: 46, testPosition: 'Yüzey', typical: 43 }
    ]
  },
  
  // 1.2436 (D6) - DIN EN ISO 4957
  {
    id: '1.2436_din_4957',
    name: '1.2436 (D6) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2436',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 2.00, maxValue: 2.10, typical: 2.05 },
      { element: 'Si', minValue: 0.10, maxValue: 0.60, typical: 0.35 },
      { element: 'Mn', minValue: 0.20, maxValue: 0.60, typical: 0.40 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 11.50, maxValue: 13.50, typical: 12.50 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1900, maxValue: 2300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 2100 },
      { property: 'Akma Dayanımı', minValue: 1700, maxValue: 2000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1850 },
      { property: 'Uzama', minValue: 3, maxValue: 8, unit: '%', testMethod: 'ISO 6892-1', typical: 5 },
      { property: 'Aşınma Direnci', minValue: 62, maxValue: 66, unit: 'HRC', testMethod: 'ASTM A681', typical: 64 },
      { property: 'Basma Dayanımı', minValue: 3000, maxValue: 3500, unit: 'MPa', testMethod: 'ASTM E9', typical: 3250 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 66, testPosition: 'Yüzey', typical: 63 }
    ]
  },
  
  // === YAY ÇELİKLERİ (SPRING STEEL) - KAPSAMLI VERİ TABANI ===
  
  // 51CrV4 - DIN EN 10089
  {
    id: '51crv4_din_10089',
    name: '51CrV4 - DIN EN 10089',
    category: 'steel',
    subCategory: 'spring_steel',
    grade: '51crv4',
    standard: 'DIN EN 10089',
    chemicalComposition: [
      { element: 'C', minValue: 0.47, maxValue: 0.55, typical: 0.51 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.28 },
      { element: 'Mn', minValue: 0.70, maxValue: 1.10, typical: 0.90 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'V', minValue: 0.10, maxValue: 0.25, typical: 0.18 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1200, maxValue: 1500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1350 },
      { property: 'Akma Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Uzama', minValue: 8, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Elastik Limit', minValue: 950, maxValue: 1200, unit: 'MPa', testMethod: 'DIN EN 10089', typical: 1075 },
      { property: 'Yorulma Dayanımı', minValue: 500, maxValue: 650, unit: 'MPa', testMethod: 'ISO 1099', typical: 575 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 38, maxValue: 45, testPosition: 'Yüzey', typical: 42 }
    ]
  },
  
  // 60Si7 - DIN EN 10089
  {
    id: '60si7_din_10089',
    name: '60Si7 - DIN EN 10089',
    category: 'steel',
    subCategory: 'spring_steel',
    grade: '60si7',
    standard: 'DIN EN 10089',
    chemicalComposition: [
      { element: 'C', minValue: 0.56, maxValue: 0.64, typical: 0.60 },
      { element: 'Si', minValue: 1.50, maxValue: 2.00, typical: 1.75 },
      { element: 'Mn', minValue: 0.60, maxValue: 1.00, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.025, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1300, maxValue: 1600, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1450 },
      { property: 'Akma Dayanımı', minValue: 1100, maxValue: 1400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1250 },
      { property: 'Uzama', minValue: 6, maxValue: 12, unit: '%', testMethod: 'ISO 6892-1', typical: 9 },
      { property: 'Elastik Limit', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'DIN EN 10089', typical: 1150 },
      { property: 'Yorulma Dayanımı', minValue: 550, maxValue: 700, unit: 'MPa', testMethod: 'ISO 1099', typical: 625 }
    ],
        hardnessRequirements: [
      { type: 'HRC', minValue: 40, maxValue: 47, testPosition: 'Yüzey', typical: 44 }
    ]
  },
  
  // === PASLANMAZ ÇELİKLER (STAINLESS STEEL) - KAPSAMLI VERİ TABANI ===
  
  // 201 (X12CrMnNi17-7-5) - DIN EN 10088-2
  {
    id: '201_din_10088_2',
    name: '201 (X12CrMnNi17-7-5) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '201',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.15, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 5.50, maxValue: 7.50, typical: 6.50 },
      { element: 'P', minValue: 0, maxValue: 0.060, typical: 0.040 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 16.00, maxValue: 18.00, typical: 17.00 },
      { element: 'Ni', minValue: 3.50, maxValue: 5.50, typical: 4.50 },
      { element: 'N', minValue: 0.25, maxValue: 0.40, typical: 0.32 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 680, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 600 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 350, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 280 },
      { property: 'Uzama', minValue: 35, maxValue: 55, unit: '%', testMethod: 'ISO 6892-1', typical: 45 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 100, maxValue: 200, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 150 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 },
      { property: 'Manyetik Geçirgenlik', minValue: 1.002, maxValue: 1.020, unit: '', testMethod: 'ASTM A342', typical: 1.010 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 160, maxValue: 220, testPosition: 'Yüzey', typical: 190 }
    ]
  },
  
  // 316Ti (X6CrNiMoTi17-12-2) - DIN EN 10088-2
  {
    id: '316ti_din_10088_2',
    name: '316Ti (X6CrNiMoTi17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316ti',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.06 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.50, maxValue: 13.50, typical: 12.00 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 },
      { element: 'Ti', minValue: 0.70, maxValue: 1.00, typical: 0.85 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 620, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 170, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 180, maxValue: 280, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 220 },
      { property: 'Korozyon Direnci', minValue: 72, maxValue: 168, unit: 'saat', testMethod: 'ASTM A262', typical: 120 },
      { property: 'Yüksek Sıcaklık Dayanımı', minValue: 600, maxValue: 800, unit: '°C', testMethod: 'ASTM A240', typical: 700 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 321 (X6CrNiTi18-10) - DIN EN 10088-2
  {
    id: '321_din_10088_2',
    name: '321 (X6CrNiTi18-10) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '321',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.06 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 17.00, maxValue: 19.00, typical: 18.00 },
      { element: 'Ni', minValue: 9.00, maxValue: 12.00, typical: 10.50 },
      { element: 'Ti', minValue: 0.70, maxValue: 1.00, typical: 0.85 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 680, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 580 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 350, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 280 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Yüksek Sıcaklık Mukavemeti', minValue: 500, maxValue: 700, unit: '°C', testMethod: 'ASTM A240', typical: 600 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // 410 (X12Cr13) - Martensitik Paslanmaz
  {
    id: '410_din_10088_2',
    name: '410 (X12Cr13) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'martensitic',
    grade: '410',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.08, maxValue: 0.15, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.040, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 11.50, maxValue: 13.50, typical: 12.50 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 450, maxValue: 700, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 575 },
      { property: 'Akma Dayanımı', minValue: 200, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 300 },
      { property: 'Uzama', minValue: 20, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 80, maxValue: 150, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 115 },
      { property: 'Manyetik Özellik', minValue: 1, maxValue: 1, unit: 'Ferromanyetik', testMethod: 'ASTM A342', typical: 1 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 22, maxValue: 32, testPosition: 'Yüzey', typical: 27 },
      { type: 'HB', minValue: 200, maxValue: 300, testPosition: 'Yüzey', typical: 250 }
    ]
  },
  
  // 420 (X20Cr13) - Martensitik Paslanmaz
  {
    id: '420_din_10088_2',
    name: '420 (X20Cr13) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'martensitic',
    grade: '420',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.16, maxValue: 0.25, typical: 0.20 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.040, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 12.00, maxValue: 14.00, typical: 13.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 700, maxValue: 850, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 775 },
      { property: 'Akma Dayanımı', minValue: 400, maxValue: 600, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 500 },
      { property: 'Uzama', minValue: 15, maxValue: 25, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 90 },
      { property: 'Aşınma Direnci', minValue: 35, maxValue: 45, unit: 'HRC', testMethod: 'ASTM A681', typical: 40 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 30, maxValue: 40, testPosition: 'Yüzey', typical: 35 }
    ]
  },
  
  // 430 (X6Cr17) - Ferritik Paslanmaz
  {
    id: '430_din_10088_2',
    name: '430 (X6Cr17) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'ferritic',
    grade: '430',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.06 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.040, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.00, maxValue: 18.00, typical: 17.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 420, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 490 },
      { property: 'Akma Dayanımı', minValue: 220, maxValue: 350, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 285 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 28 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 90 },
      { property: 'Manyetik Özellik', minValue: 1, maxValue: 1, unit: 'Ferromanyetik', testMethod: 'ASTM A342', typical: 1 },
      { property: 'Korozyon Direnci', minValue: 12, maxValue: 48, unit: 'saat', testMethod: 'ASTM A262', typical: 24 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 220, testPosition: 'Yüzey', typical: 185 }
    ]
  },
  
  // 2205 (X2CrNiMoN22-5-3) - Duplex Paslanmaz
  {
    id: '2205_din_10088_2',
    name: '2205 (X2CrNiMoN22-5-3) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'duplex',
    grade: '2205',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 21.00, maxValue: 23.00, typical: 22.00 },
      { element: 'Ni', minValue: 4.50, maxValue: 6.50, typical: 5.50 },
      { element: 'Mo', minValue: 2.50, maxValue: 3.50, typical: 3.00 },
      { element: 'N', minValue: 0.08, maxValue: 0.20, typical: 0.14 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 620, maxValue: 880, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 750 },
      { property: 'Akma Dayanımı', minValue: 450, maxValue: 650, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Uzama', minValue: 25, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 90 },
      { property: 'Korozyon Direnci (PREN)', minValue: 32, maxValue: 40, unit: '', testMethod: 'ASTM G48', typical: 36 },
      { property: 'Çukur Korozyon Direnci', minValue: 250, maxValue: 350, unit: '°C', testMethod: 'ASTM G48', typical: 300 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 230, maxValue: 290, testPosition: 'Yüzey', typical: 260 }
    ]
  },
  
  // === ALÜMİNYUM ALAŞIMLARI - KAPSAMLI VERİ TABANI ===
  
  // 1050 - DIN EN 573-3
  {
    id: '1050_din_573_3',
    name: '1050 - DIN EN 573-3',
    category: 'aluminum',
    subCategory: 'al_1000',
    grade: '1050',
    standard: 'DIN EN 573-3',
    chemicalComposition: [
      { element: 'Al', minValue: 99.50, maxValue: 100.00, typical: 99.75 },
      { element: 'Fe', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Si', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Cu', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'Mn', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'Mg', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'Zn', minValue: 0, maxValue: 0.07, typical: 0.035 },
      { element: 'Ti', minValue: 0, maxValue: 0.05, typical: 0.025 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 65, maxValue: 95, unit: 'MPa', testMethod: 'ASTM B557', typical: 80 },
      { property: 'Akma Dayanımı', minValue: 20, maxValue: 40, unit: 'MPa', testMethod: 'ASTM B557', typical: 30 },
      { property: 'Uzama', minValue: 35, maxValue: 50, unit: '%', testMethod: 'ASTM B557', typical: 42 },
      { property: 'Elastisite Modülü', minValue: 68, maxValue: 72, unit: 'GPa', testMethod: 'ASTM E111', typical: 70 },
      { property: 'Elektriksel İletkenlik', minValue: 60, maxValue: 65, unit: '%IACS', testMethod: 'ASTM B193', typical: 62 },
      { property: 'Termal İletkenlik', minValue: 230, maxValue: 250, unit: 'W/mK', testMethod: 'ASTM E1461', typical: 240 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 15, maxValue: 25, testPosition: 'Yüzey', typical: 20 }
    ]
  },
  
  // 2024-T4 - ASTM B211
  {
    id: '2024_t4_astm_b211',
    name: '2024-T4 - ASTM B211',
    category: 'aluminum',
    subCategory: 'al_2000',
    grade: '2024',
    standard: 'ASTM B211',
    chemicalComposition: [
      { element: 'Al', minValue: 90.70, maxValue: 94.70, typical: 92.70 },
      { element: 'Cu', minValue: 3.80, maxValue: 4.90, typical: 4.35 },
      { element: 'Mg', minValue: 1.20, maxValue: 1.80, typical: 1.50 },
      { element: 'Mn', minValue: 0.30, maxValue: 0.90, typical: 0.60 },
      { element: 'Fe', minValue: 0, maxValue: 0.50, typical: 0.25 },
      { element: 'Si', minValue: 0, maxValue: 0.50, typical: 0.25 },
      { element: 'Zn', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Ti', minValue: 0, maxValue: 0.15, typical: 0.07 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 425, maxValue: 485, unit: 'MPa', testMethod: 'ASTM B557', typical: 455 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 325, unit: 'MPa', testMethod: 'ASTM B557', typical: 300 },
      { property: 'Uzama', minValue: 15, maxValue: 25, unit: '%', testMethod: 'ASTM B557', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 25, maxValue: 40, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 32 },
      { property: 'Yorulma Dayanımı', minValue: 130, maxValue: 160, unit: 'MPa', testMethod: 'ASTM D7791', typical: 145 },
      { property: 'Elastisite Modülü', minValue: 70, maxValue: 74, unit: 'GPa', testMethod: 'ASTM E111', typical: 72 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 115, maxValue: 135, testPosition: 'Yüzey', typical: 125 }
    ]
  },
  
  // 5083-H111 - DIN EN 573-3
  {
    id: '5083_h111_din_573_3',
    name: '5083-H111 - DIN EN 573-3',
    category: 'aluminum',
    subCategory: 'al_5000',
    grade: '5083',
    standard: 'DIN EN 573-3',
    chemicalComposition: [
      { element: 'Al', minValue: 93.40, maxValue: 96.80, typical: 95.10 },
      { element: 'Mg', minValue: 4.00, maxValue: 4.90, typical: 4.45 },
      { element: 'Mn', minValue: 0.40, maxValue: 1.00, typical: 0.70 },
      { element: 'Cr', minValue: 0.05, maxValue: 0.25, typical: 0.15 },
      { element: 'Fe', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Cu', minValue: 0, maxValue: 0.10, typical: 0.05 },
      { element: 'Zn', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Ti', minValue: 0, maxValue: 0.15, typical: 0.07 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 270, maxValue: 350, unit: 'MPa', testMethod: 'ASTM B557', typical: 310 },
      { property: 'Akma Dayanımı', minValue: 110, maxValue: 160, unit: 'MPa', testMethod: 'ASTM B557', typical: 135 },
      { property: 'Uzama', minValue: 16, maxValue: 25, unit: '%', testMethod: 'ASTM B557', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 90, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 75 },
      { property: 'Deniz Suyu Korozyon Direnci', minValue: 1, maxValue: 1, unit: 'Mükemmel', testMethod: 'ASTM G44', typical: 1 },
      { property: 'Kaynak Edilebilirlik', minValue: 1, maxValue: 1, unit: 'İyi', testMethod: 'AWS D1.2', typical: 1 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 65, maxValue: 85, testPosition: 'Yüzey', typical: 75 }
    ]
  },
  
  // === TİTANYUM ALAŞIMLARI - KAPSAMLI VERİ TABANI ===
  
  // Grade 2 - ASTM B265
  {
    id: 'ti_grade2_astm_b265',
    name: 'Titanyum Grade 2 - ASTM B265',
    category: 'titanium',
    subCategory: 'ti_pure',
    grade: 'ti_grade2',
    standard: 'ASTM B265',
    chemicalComposition: [
      { element: 'Ti', minValue: 98.90, maxValue: 99.60, typical: 99.25 },
      { element: 'Fe', minValue: 0, maxValue: 0.30, typical: 0.15 },
      { element: 'O', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'C', minValue: 0, maxValue: 0.10, typical: 0.05 },
      { element: 'N', minValue: 0, maxValue: 0.03, typical: 0.015 },
      { element: 'H', minValue: 0, maxValue: 0.015, typical: 0.008 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 345, maxValue: 480, unit: 'MPa', testMethod: 'ASTM E8', typical: 415 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 410, unit: 'MPa', testMethod: 'ASTM E8', typical: 340 },
      { property: 'Uzama', minValue: 20, maxValue: 30, unit: '%', testMethod: 'ASTM E8', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 25, maxValue: 50, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 37 },
      { property: 'Elastisite Modülü', minValue: 102, maxValue: 108, unit: 'GPa', testMethod: 'ASTM E111', typical: 105 },
      { property: 'Biyouyumluluk', minValue: 1, maxValue: 1, unit: 'Mükemmel', testMethod: 'ISO 10993', typical: 1 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 200, maxValue: 290, testPosition: 'Yüzey', typical: 245 }
    ]
  },
  
  // S235J0 - DIN EN 10025-2
  {
    id: 's235j0_din_10025_2',
    name: 'S235J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S235J2 - DIN EN 10025-2
  {
    id: 's235j2_din_10025_2',
    name: 'S235J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S275J0 - DIN EN 10025-2
  {
    id: 's275j0_din_10025_2',
    name: 'S275J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S275J2 - DIN EN 10025-2
  {
    id: 's275j2_din_10025_2',
    name: 'S275J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JR - DIN EN 10025-2
  {
    id: 's355jr_din_10025_2',
    name: 'S355JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355J0 - DIN EN 10025-2
  {
    id: 's355j0_din_10025_2',
    name: 'S355J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-2
  {
    id: 's355k2_din_10025_2',
    name: 'S355K2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER EKSİK VERİLER ===
  
  // 16MnCr5 - DIN EN 10084
  {
    id: '16mncr5_din_10084',
    name: '16MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '16mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.14, maxValue: 0.19, typical: 0.16 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.30, typical: 1.15 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.80, maxValue: 1.10, typical: 0.95 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1050 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 10, maxValue: 16, unit: '%', testMethod: 'ISO 6892-1', typical: 13 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 50, maxValue: 90, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ISO 1099', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 },
      { type: 'HB', minValue: 250, maxValue: 320, testPosition: 'Çekirdek', typical: 285 }
    ]
  },
  
  // 18CrMo4 - DIN EN 10028-2
  {
    id: '18crmo4_din_10028_2',
    name: '18CrMo4 - DIN EN 10028-2',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '18crmo4',
    standard: 'DIN EN 10028-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.15, maxValue: 0.21, typical: 0.18 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 0.90, typical: 0.65 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 440, maxValue: 590, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 515 },
      { property: 'Akma Dayanımı', minValue: 290, maxValue: 440, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 365 },
      { property: 'Uzama', minValue: 22, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 60 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 170, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // 20MnCr5 - DIN EN 10084
  {
    id: '20mncr5_din_10084',
    name: '20MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '20mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.17, maxValue: 0.23, typical: 0.20 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.10, maxValue: 1.40, typical: 1.25 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.00, maxValue: 1.30, typical: 1.15 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 9, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 45, maxValue: 85, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 65 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 65, testPosition: 'Yüzey', typical: 62 },
      { type: 'HB', minValue: 270, maxValue: 340, testPosition: 'Çekirdek', typical: 305 }
    ]
  },
  
  // === PASLANMAZ ÇELİK EKSİK VERİLER ===
  
  // 304L - DIN EN 10088-2
  {
    id: '304l_din_10088_2',
    name: '304L (X2CrNi19-11) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 18.00, maxValue: 20.00, typical: 19.00 },
      { element: 'Ni', minValue: 10.00, maxValue: 12.00, typical: 11.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 316 - DIN EN 10088-2
  {
    id: '316_din_10088_2',
    name: '316 (X5CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // 316L - DIN EN 10088-2
  {
    id: '316l_din_10088_2',
    name: '316L (X2CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === YAPISAL ÇELİKLER (STRUCTURAL STEEL) - EKSİK VERİLER EKLENİYOR ===
  
  // S235J0 - DIN EN 10025-2
  {
    id: 's235j0_din_10025_2',
    name: 'S235J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S235J2 - DIN EN 10025-2
  {
    id: 's235j2_din_10025_2',
    name: 'S235J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S275J0 - DIN EN 10025-2
  {
    id: 's275j0_din_10025_2',
    name: 'S275J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S275J2 - DIN EN 10025-2
  {
    id: 's275j2_din_10025_2',
    name: 'S275J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JR - DIN EN 10025-2
  {
    id: 's355jr_din_10025_2',
    name: 'S355JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355J0 - DIN EN 10025-2
  {
    id: 's355j0_din_10025_2',
    name: 'S355J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-2
  {
    id: 's355k2_din_10025_2',
    name: 'S355K2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER EKSİK VERİLER ===
  
  // 16MnCr5 - DIN EN 10084
  {
    id: '16mncr5_din_10084',
    name: '16MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '16mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.14, maxValue: 0.19, typical: 0.16 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.30, typical: 1.15 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.80, maxValue: 1.10, typical: 0.95 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1050 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 10, maxValue: 16, unit: '%', testMethod: 'ISO 6892-1', typical: 13 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 50, maxValue: 90, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ISO 1099', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 },
      { type: 'HB', minValue: 250, maxValue: 320, testPosition: 'Çekirdek', typical: 285 }
    ]
  },
  
  // 18CrMo4 - DIN EN 10028-2
  {
    id: '18crmo4_din_10028_2',
    name: '18CrMo4 - DIN EN 10028-2',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '18crmo4',
    standard: 'DIN EN 10028-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.15, maxValue: 0.21, typical: 0.18 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 0.90, typical: 0.65 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 440, maxValue: 590, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 515 },
      { property: 'Akma Dayanımı', minValue: 290, maxValue: 440, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 365 },
      { property: 'Uzama', minValue: 22, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 60 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 170, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // 20MnCr5 - DIN EN 10084
  {
    id: '20mncr5_din_10084',
    name: '20MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '20mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.17, maxValue: 0.23, typical: 0.20 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.10, maxValue: 1.40, typical: 1.25 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.00, maxValue: 1.30, typical: 1.15 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 9, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 45, maxValue: 85, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 65 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 65, testPosition: 'Yüzey', typical: 62 },
      { type: 'HB', minValue: 270, maxValue: 340, testPosition: 'Çekirdek', typical: 305 }
    ]
  },
  
  // === PASLANMAZ ÇELİK EKSİK VERİLER ===
  
  // 304L - DIN EN 10088-2
  {
    id: '304l_din_10088_2',
    name: '304L (X2CrNi19-11) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 18.00, maxValue: 20.00, typical: 19.00 },
      { element: 'Ni', minValue: 10.00, maxValue: 12.00, typical: 11.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 316 - DIN EN 10088-2
  {
    id: '316_din_10088_2',
    name: '316 (X5CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // 316L - DIN EN 10088-2
  {
    id: '316l_din_10088_2',
    name: '316L (X2CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === YAPISAL ÇELİKLER (STRUCTURAL STEEL) - EKSİK VERİLER EKLENİYOR ===
  
  // S235J0 - DIN EN 10025-2
  {
    id: 's235j0_din_10025_2',
    name: 'S235J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S235J2 - DIN EN 10025-2
  {
    id: 's235j2_din_10025_2',
    name: 'S235J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S275J0 - DIN EN 10025-2
  {
    id: 's275j0_din_10025_2',
    name: 'S275J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S275J2 - DIN EN 10025-2
  {
    id: 's275j2_din_10025_2',
    name: 'S275J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JR - DIN EN 10025-2
  {
    id: 's355jr_din_10025_2',
    name: 'S355JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355J0 - DIN EN 10025-2
  {
    id: 's355j0_din_10025_2',
    name: 'S355J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-2
  {
    id: 's355k2_din_10025_2',
    name: 'S355K2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER EKSİK VERİLER ===
  
  // 16MnCr5 - DIN EN 10084
  {
    id: '16mncr5_din_10084',
    name: '16MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '16mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.14, maxValue: 0.19, typical: 0.16 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.30, typical: 1.15 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.80, maxValue: 1.10, typical: 0.95 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1050 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 10, maxValue: 16, unit: '%', testMethod: 'ISO 6892-1', typical: 13 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 50, maxValue: 90, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ISO 1099', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 },
      { type: 'HB', minValue: 250, maxValue: 320, testPosition: 'Çekirdek', typical: 285 }
    ]
  },
  
  // 18CrMo4 - DIN EN 10028-2
  {
    id: '18crmo4_din_10028_2',
    name: '18CrMo4 - DIN EN 10028-2',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '18crmo4',
    standard: 'DIN EN 10028-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.15, maxValue: 0.21, typical: 0.18 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 0.90, typical: 0.65 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 440, maxValue: 590, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 515 },
      { property: 'Akma Dayanımı', minValue: 290, maxValue: 440, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 365 },
      { property: 'Uzama', minValue: 22, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 60 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 170, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // 20MnCr5 - DIN EN 10084
  {
    id: '20mncr5_din_10084',
    name: '20MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '20mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.17, maxValue: 0.23, typical: 0.20 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.10, maxValue: 1.40, typical: 1.25 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.00, maxValue: 1.30, typical: 1.15 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 9, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 45, maxValue: 85, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 65 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 65, testPosition: 'Yüzey', typical: 62 },
      { type: 'HB', minValue: 270, maxValue: 340, testPosition: 'Çekirdek', typical: 305 }
    ]
  },
  
  // === PASLANMAZ ÇELİK EKSİK VERİLER ===
  
  // 304L - DIN EN 10088-2
  {
    id: '304l_din_10088_2',
    name: '304L (X2CrNi19-11) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 18.00, maxValue: 20.00, typical: 19.00 },
      { element: 'Ni', minValue: 10.00, maxValue: 12.00, typical: 11.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 316 - DIN EN 10088-2
  {
    id: '316_din_10088_2',
    name: '316 (X5CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // 316L - DIN EN 10088-2
  {
    id: '316l_din_10088_2',
    name: '316L (X2CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === YAPISAL ÇELİKLER (STRUCTURAL STEEL) - EKSİK VERİLER EKLENİYOR ===
  
  // S235J0 - DIN EN 10025-2
  {
    id: 's235j0_din_10025_2',
    name: 'S235J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S235J2 - DIN EN 10025-2
  {
    id: 's235j2_din_10025_2',
    name: 'S235J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S275J0 - DIN EN 10025-2
  {
    id: 's275j0_din_10025_2',
    name: 'S275J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S275J2 - DIN EN 10025-2
  {
    id: 's275j2_din_10025_2',
    name: 'S275J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JR - DIN EN 10025-2
  {
    id: 's355jr_din_10025_2',
    name: 'S355JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355J0 - DIN EN 10025-2
  {
    id: 's355j0_din_10025_2',
    name: 'S355J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-2
  {
    id: 's355k2_din_10025_2',
    name: 'S355K2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER EKSİK VERİLER ===
  
  // 16MnCr5 - DIN EN 10084
  {
    id: '16mncr5_din_10084',
    name: '16MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '16mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.14, maxValue: 0.19, typical: 0.16 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.30, typical: 1.15 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.80, maxValue: 1.10, typical: 0.95 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1050 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 10, maxValue: 16, unit: '%', testMethod: 'ISO 6892-1', typical: 13 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 50, maxValue: 90, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ISO 1099', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 },
      { type: 'HB', minValue: 250, maxValue: 320, testPosition: 'Çekirdek', typical: 285 }
    ]
  },
  
  // 18CrMo4 - DIN EN 10028-2
  {
    id: '18crmo4_din_10028_2',
    name: '18CrMo4 - DIN EN 10028-2',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '18crmo4',
    standard: 'DIN EN 10028-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.15, maxValue: 0.21, typical: 0.18 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 0.90, typical: 0.65 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 440, maxValue: 590, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 515 },
      { property: 'Akma Dayanımı', minValue: 290, maxValue: 440, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 365 },
      { property: 'Uzama', minValue: 22, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 60 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 170, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // 20MnCr5 - DIN EN 10084
  {
    id: '20mncr5_din_10084',
    name: '20MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '20mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.17, maxValue: 0.23, typical: 0.20 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.10, maxValue: 1.40, typical: 1.25 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.00, maxValue: 1.30, typical: 1.15 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 9, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 45, maxValue: 85, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 65 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 65, testPosition: 'Yüzey', typical: 62 },
      { type: 'HB', minValue: 270, maxValue: 340, testPosition: 'Çekirdek', typical: 305 }
    ]
  },
  
  // === PASLANMAZ ÇELİK EKSİK VERİLER ===
  
  // 304L - DIN EN 10088-2
  {
    id: '304l_din_10088_2',
    name: '304L (X2CrNi19-11) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 18.00, maxValue: 20.00, typical: 19.00 },
      { element: 'Ni', minValue: 10.00, maxValue: 12.00, typical: 11.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 316 - DIN EN 10088-2
  {
    id: '316_din_10088_2',
    name: '316 (X5CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // 316L - DIN EN 10088-2
  {
    id: '316l_din_10088_2',
    name: '316L (X2CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === YAPISAL ÇELİKLER (STRUCTURAL STEEL) - EKSİK VERİLER EKLENİYOR ===
  
  // S235J0 - DIN EN 10025-2
  {
    id: 's235j0_din_10025_2',
    name: 'S235J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S235J2 - DIN EN 10025-2
  {
    id: 's235j2_din_10025_2',
    name: 'S235J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  
  // S275J0 - DIN EN 10025-2
  {
    id: 's275j0_din_10025_2',
    name: 'S275J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S275J2 - DIN EN 10025-2
  {
    id: 's275j2_din_10025_2',
    name: 'S275J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JR - DIN EN 10025-2
  {
    id: 's355jr_din_10025_2',
    name: 'S355JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355J0 - DIN EN 10025-2
  {
    id: 's355j0_din_10025_2',
    name: 'S355J0 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j0',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-2
  {
    id: 's355k2_din_10025_2',
    name: 'S355K2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER EKSİK VERİLER ===
  
  // 16MnCr5 - DIN EN 10084
  {
    id: '16mncr5_din_10084',
    name: '16MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '16mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.14, maxValue: 0.19, typical: 0.16 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.30, typical: 1.15 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.80, maxValue: 1.10, typical: 0.95 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1050 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 10, maxValue: 16, unit: '%', testMethod: 'ISO 6892-1', typical: 13 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 50, maxValue: 90, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ISO 1099', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 },
      { type: 'HB', minValue: 250, maxValue: 320, testPosition: 'Çekirdek', typical: 285 }
    ]
  },
  
  // 18CrMo4 - DIN EN 10028-2
  {
    id: '18crmo4_din_10028_2',
    name: '18CrMo4 - DIN EN 10028-2',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '18crmo4',
    standard: 'DIN EN 10028-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.15, maxValue: 0.21, typical: 0.18 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 0.90, typical: 0.65 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 440, maxValue: 590, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 515 },
      { property: 'Akma Dayanımı', minValue: 290, maxValue: 440, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 365 },
      { property: 'Uzama', minValue: 22, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 60 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 170, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // 20MnCr5 - DIN EN 10084
  {
    id: '20mncr5_din_10084',
    name: '20MnCr5 - DIN EN 10084',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '20mncr5',
    standard: 'DIN EN 10084',
    chemicalComposition: [
      { element: 'C', minValue: 0.17, maxValue: 0.23, typical: 0.20 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 1.10, maxValue: 1.40, typical: 1.25 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.00, maxValue: 1.30, typical: 1.15 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 9, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 45, maxValue: 85, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 65 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 65, testPosition: 'Yüzey', typical: 62 },
      { type: 'HB', minValue: 270, maxValue: 340, testPosition: 'Çekirdek', typical: 305 }
    ]
  },
  
  // === PASLANMAZ ÇELİK EKSİK VERİLER ===
  
  // 304L - DIN EN 10088-2
  {
    id: '304l_din_10088_2',
    name: '304L (X2CrNi19-11) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 18.00, maxValue: 20.00, typical: 19.00 },
      { element: 'Ni', minValue: 10.00, maxValue: 12.00, typical: 11.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 690, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 590 },
      { property: 'Akma Dayanımı', minValue: 175, maxValue: 280, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 230 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 316 - DIN EN 10088-2
  {
    id: '316_din_10088_2',
    name: '316 (X5CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Korozyon Direnci (PREN)', minValue: 24, maxValue: 26, unit: '', testMethod: 'ASTM G48', typical: 25 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  }
];

const MaterialCertificateTracking: React.FC = () => {
  const theme = useTheme();
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialRecord | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  
  // Auto-integration states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('');
  const [autoIntegrationReady, setAutoIntegrationReady] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<MaterialRecord>>({
    materialName: '',
    supplier: '',
    partNumber: '',
    packageNumber: '',
    castNumber: '',
    certificateNumber: '',
    certificateStandard: '',
    certificateDate: '',
    batchNumber: '',
    receivedDate: '',
    quantity: 0,
    unit: 'kg',
    standard: '',
    grade: '',
    chemicalComposition: [],
    hardnessValues: [],
    mechanicalProperties: [],
    certificates: [],
    overallStatus: 'BEKLEMEDE',
    notes: '',
    inspector: '',
    inspectionDate: '',
    traceabilityNumber: ''
  });

  // Load materials from localStorage on component mount with recovery system
  useEffect(() => {
    // Primary localStorage key
    const savedMaterials = localStorage.getItem('materialCertificates');
    
    // Backup keys for recovery
    const backupKeys = ['materialCertificateTracking', 'materials_backup', 'malzeme_sertifika'];
    
    let materialsData = null;
    
    if (savedMaterials) {
      try {
        materialsData = JSON.parse(savedMaterials);
      } catch (error) {
        console.error('Primary materials data corrupted, trying backups...', error);
      }
    }
    
    // Try backup keys if primary failed
    if (!materialsData || materialsData.length === 0) {
      for (const backupKey of backupKeys) {
        const backupData = localStorage.getItem(backupKey);
        if (backupData) {
          try {
            const parsed = JSON.parse(backupData);
            if (parsed && parsed.length > 0) {
              materialsData = parsed;
              console.log(`📋 Malzemeler ${backupKey} backup'ından geri yüklendi!`);
              break;
      }
    } catch (error) {
            console.error(`Backup ${backupKey} corrupted`, error);
          }
        }
      }
    }
    
    // Sample data if no data found
    if (!materialsData || materialsData.length === 0) {
      materialsData = [
        {
          id: 'sample_1',
          materialCode: 'S355J2',
          materialName: 'S355J2',
          supplier: 'Örnek Çelik A.Ş.',
          partNumber: 'PT-001',
          packageNumber: 'PKG-001',
          castNumber: 'CST-001',
          certificateNumber: 'CERT-001',
          certificateStandard: '3.1',
          certificateDate: '2024-01-15',
          batchNumber: 'LOT-001',
          receivedDate: '2024-01-16',
          quantity: 1000,
          unit: 'kg',
          standard: 'DIN EN 10025-3',
          grade: 's355j2',
          chemicalComposition: [],
          hardnessValues: [],
          mechanicalProperties: [],
          certificates: [],
          overallStatus: 'BEKLEMEDE',
          notes: '',
          inspector: '',
          inspectionDate: '',
          traceabilityNumber: 'TRC-sample-1'
        }
      ];
      console.log('📋 Örnek malzeme verisi yüklendi');
    }
    
    setMaterials(materialsData);
    setFilteredMaterials(materialsData);
    
    // Create backup
    localStorage.setItem('materials_backup', JSON.stringify(materialsData));
    
  }, []);

  // Save materials to localStorage whenever materials change
  useEffect(() => {
    localStorage.setItem('materialCertificates', JSON.stringify(materials));
  }, [materials]);

  // Filter materials based on search and status
  useEffect(() => {
    let filtered = materials;
    
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(material => material.overallStatus === statusFilter);
    }
    
    setFilteredMaterials(filtered);
  }, [materials, searchTerm, statusFilter]);

  // Check if auto-integration is ready
  useEffect(() => {
    setAutoIntegrationReady(!!(selectedCategory && selectedSubCategory && selectedGrade && selectedStandard));
  }, [selectedCategory, selectedSubCategory, selectedGrade, selectedStandard]);

  // Auto-fill material name from grade selection
  useEffect(() => {
    if (selectedGrade) {
      const selectedGradeData = getGrades().find(g => g.id === selectedGrade);
      if (selectedGradeData) {
        setFormData(prev => ({
          ...prev,
          materialName: selectedGradeData.name,
          materialCode: selectedGradeData.name,
          grade: selectedGrade
        }));
      }
    }
  }, [selectedGrade]);

  const getSubCategories = () => {
    const category = materialCategories.find(cat => cat.id === selectedCategory);
    return category?.subCategories || [];
  };

  const getGrades = () => {
    const category = materialCategories.find(cat => cat.id === selectedCategory);
    const subCategory = category?.subCategories.find(sub => sub.id === selectedSubCategory);
    return subCategory?.grades || [];
  };

  const getStandards = () => {
    const category = materialCategories.find(cat => cat.id === selectedCategory);
    const subCategory = category?.subCategories.find(sub => sub.id === selectedSubCategory);
    const grade = subCategory?.grades.find(g => g.id === selectedGrade);
    return grade?.standards || [];
  };

  const handleAutoIntegration = () => {
    if (!autoIntegrationReady) return;

    const materialStandard = materialStandards.find(ms =>
      ms.category === selectedCategory &&
      ms.subCategory === selectedSubCategory &&
      ms.grade === selectedGrade &&
      ms.standard === selectedStandard
    );

    if (materialStandard) {
      setFormData(prev => ({
        ...prev,
        standard: materialStandard.standard,
        grade: materialStandard.grade,
        chemicalComposition: materialStandard.chemicalComposition.map(comp => {
          const value = comp.typical || (comp.minValue + comp.maxValue) / 2;
          return {
            element: comp.element,
            percentage: value,
            specification: `${comp.minValue}-${comp.maxValue}%`,
            minValue: comp.minValue,
            maxValue: comp.maxValue,
            status: getAutoStatus(value, comp.minValue, comp.maxValue)
          };
        }),
        mechanicalProperties: materialStandard.mechanicalProperties.map(prop => {
          const value = prop.typical || (prop.minValue + prop.maxValue) / 2;
          return {
            property: prop.property,
            value: value,
            unit: prop.unit,
            specification: `${prop.minValue}-${prop.maxValue} ${prop.unit}`,
            minValue: prop.minValue,
            maxValue: prop.maxValue,
            testMethod: prop.testMethod,
            status: getAutoStatus(value, prop.minValue, prop.maxValue)
          };
        }),
        hardnessValues: materialStandard.hardnessRequirements.map(hardness => {
          const value = hardness.typical || (hardness.minValue + hardness.maxValue) / 2;
          return {
            type: hardness.type,
            value: value,
            specification: `${hardness.minValue}-${hardness.maxValue} ${hardness.type}`,
            minValue: hardness.minValue,
            maxValue: hardness.maxValue,
            testPosition: hardness.testPosition,
            status: getAutoStatus(value, hardness.minValue, hardness.maxValue)
          };
        })
      }));

      setSnackbar({
        open: true,
        message: 'Standart entegre edildi! Değerler otomatik olarak KABUL/RET durumuna göre değerlendirildi.',
        severity: 'success'
      });
    }
  };

  const handleSpecificationsOnly = () => {
    if (!autoIntegrationReady) return;

    const materialStandard = materialStandards.find(ms =>
      ms.category === selectedCategory &&
      ms.subCategory === selectedSubCategory &&
      ms.grade === selectedGrade &&
      ms.standard === selectedStandard
    );

    if (materialStandard) {
      setFormData(prev => ({
        ...prev,
        standard: materialStandard.standard,
        grade: materialStandard.grade,
        chemicalComposition: materialStandard.chemicalComposition.map(comp => ({
          element: comp.element,
          percentage: 0, // Empty values
          specification: `${comp.minValue}-${comp.maxValue}%`,
          minValue: comp.minValue,
          maxValue: comp.maxValue,
          status: 'BEKLEMEDE' as const
        })),
        mechanicalProperties: materialStandard.mechanicalProperties.map(prop => ({
          property: prop.property,
          value: 0, // Empty values
          unit: prop.unit,
          specification: `${prop.minValue}-${prop.maxValue} ${prop.unit}`,
          minValue: prop.minValue,
          maxValue: prop.maxValue,
          testMethod: prop.testMethod,
          status: 'BEKLEMEDE' as const
        })),
        hardnessValues: materialStandard.hardnessRequirements.map(hardness => ({
          type: hardness.type,
          value: 0, // Empty values
          specification: `${hardness.minValue}-${hardness.maxValue} ${hardness.type}`,
          minValue: hardness.minValue,
          maxValue: hardness.maxValue,
          testPosition: hardness.testPosition,
          status: 'BEKLEMEDE' as const
        }))
      }));

      setSnackbar({
        open: true,
        message: 'Spesifikasyonlar yüklendi! Değerleri girdikçe otomatik olarak KABUL/RET durumu güncellenecek.',
        severity: 'info'
      });
    }
  };

  const getAutoStatus = (value: number, minValue: number, maxValue: number): 'KABUL' | 'RET' | 'UYARI' => {
    if (value >= minValue && value <= maxValue) {
    return 'KABUL';
    } else if (value < minValue * 0.95 || value > maxValue * 1.05) {
      return 'RET';
    } else {
      return 'UYARI';
    }
  };

  const handleSave = () => {
    if (!formData.materialName || !formData.supplier) {
      setSnackbar({
        open: true,
        message: 'Malzeme adı ve tedarikçi alanları zorunludur',
        severity: 'error'
      });
      return;
    }

    const newMaterial: MaterialRecord = {
      id: editingMaterial?.id || Date.now().toString(),
      materialCode: formData.materialName || '',
      materialName: formData.materialName || '',
      supplier: formData.supplier || '',
      partNumber: formData.partNumber || '',
      packageNumber: formData.packageNumber || '',
      castNumber: formData.castNumber || '',
      certificateNumber: formData.certificateNumber || '',
      certificateStandard: formData.certificateStandard || '',
      certificateDate: formData.certificateDate || '',
      batchNumber: formData.batchNumber || '',
      receivedDate: formData.receivedDate || new Date().toISOString().split('T')[0],
      quantity: formData.quantity || 0,
      unit: formData.unit || 'kg',
      standard: formData.standard || '',
      grade: formData.grade || '',
      chemicalComposition: formData.chemicalComposition || [],
      hardnessValues: formData.hardnessValues || [],
      mechanicalProperties: formData.mechanicalProperties || [],
      certificates: formData.certificates || [],
      overallStatus: formData.overallStatus || 'BEKLEMEDE',
      notes: formData.notes || '',
      inspector: formData.inspector || '',
      inspectionDate: formData.inspectionDate || '',
      traceabilityNumber: formData.traceabilityNumber || `TRC-${Date.now()}`
    };

    if (editingMaterial) {
      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? newMaterial : m));
      setSnackbar({
        open: true,
        message: 'Malzeme başarıyla güncellendi',
        severity: 'success'
      });
    } else {
      setMaterials(prev => [...prev, newMaterial]);
      setSnackbar({
        open: true,
        message: 'Malzeme başarıyla eklendi',
        severity: 'success'
      });
    }

    handleClose();
  };

  const handleEdit = (material: MaterialRecord) => {
    setEditingMaterial(material);
    setFormData(material);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    setSnackbar({
      open: true,
      message: 'Malzeme başarıyla silindi',
      severity: 'success'
    });
  };

  const handleView = (material: MaterialRecord) => {
    setSelectedMaterial(material);
    setViewDialogOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMaterial(null);
    setFormData({
      materialName: '',
      supplier: '',
      partNumber: '',
      packageNumber: '',
      castNumber: '',
      certificateNumber: '',
      certificateStandard: '',
      certificateDate: '',
      batchNumber: '',
      receivedDate: '',
      quantity: 0,
      unit: 'kg',
      standard: '',
      grade: '',
      chemicalComposition: [],
      hardnessValues: [],
      mechanicalProperties: [],
      certificates: [],
      overallStatus: 'BEKLEMEDE',
      notes: '',
      inspector: '',
      inspectionDate: '',
      traceabilityNumber: ''
    });
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedGrade('');
    setSelectedStandard('');
    setTabValue(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONAYLANMIS': return 'success';
      case 'RETEDİLDİ': return 'error';
      case 'ŞARTLI': return 'warning';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ONAYLANMIS': return 'ONAYLANMIŞ';
      case 'RETEDİLDİ': return 'RET';
      case 'ŞARTLI': return 'ŞARTLI';
      case 'BEKLEMEDE': return 'BEKLEMEDE';
      default: return status;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: `Dosya boyutu 10MB'dan büyük olamaz: ${file.name}`,
          severity: 'error'
        });
      return;
    }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `Desteklenmeyen dosya türü: ${file.name}`,
          severity: 'error'
        });
      return;
    }

      const reader = new FileReader();
      reader.onload = (e) => {
        const certificate: Certificate = {
          id: Date.now().toString() + Math.random(),
          fileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          size: file.size,
          url: e.target?.result as string
        };

      setFormData(prev => ({
        ...prev,
          certificates: [...(prev.certificates || []), certificate]
        }));

        setSnackbar({
          open: true,
          message: `Sertifika yüklendi: ${file.name}`,
          severity: 'success'
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    const link = document.createElement('a');
    link.href = certificate.url;
    link.download = certificate.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    try {
      window.open(certificate.url, '_blank');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Dosya görüntüleme hatası',
        severity: 'error'
      });
    }
  };

  const handleDeleteCertificate = (certificateId: string) => {
      setFormData(prev => ({
        ...prev,
      certificates: prev.certificates?.filter(cert => cert.id !== certificateId) || []
    }));

    setSnackbar({
      open: true,
      message: 'Sertifika silindi',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
        Malzeme Sertifika Takibi
      </Typography>

      {/* Header Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
          placeholder="Malzeme, tedarikçi veya parti ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
          sx={{ minWidth: 300 }}
            />
        
        <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Durum Filtresi</InputLabel>
              <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
                label="Durum Filtresi"
              >
            <MenuItem value="ALL">Tümü</MenuItem>
                <MenuItem value="BEKLEMEDE">Beklemede</MenuItem>
            <MenuItem value="ONAYLANMIS">Onaylanmış</MenuItem>
            <MenuItem value="RETEDİLDİ">RET</MenuItem>
            <MenuItem value="ŞARTLI">Şartlı</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ ml: 'auto' }}
        >
          Yeni Malzeme Kaydı
            </Button>
          </Box>

      {/* Materials Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
            <TableHead>
            <TableRow>
              <TableCell>Malzeme Adı</TableCell>
              <TableCell>Tedarikçi</TableCell>
              <TableCell>Parti No</TableCell>
              <TableCell>Standart</TableCell>
              <TableCell>Kalite</TableCell>
              <TableCell>Sertifika</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm || statusFilter !== 'ALL' 
                      ? 'Filtrelere uygun malzeme bulunamadı'
                      : 'Henüz malzeme kaydı yok. İlk kaydınızı oluşturun.'
                    }
                  </Typography>
                  </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => (
                <TableRow key={material.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {material.materialName}
                    </Typography>
                  </TableCell>
                  <TableCell>{material.supplier}</TableCell>
                  <TableCell>{material.batchNumber}</TableCell>
                  <TableCell>{material.standard}</TableCell>
                  <TableCell>{material.grade}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${material.certificates.length} sertifika`}
                      size="small"
                      color={material.certificates.length > 0 ? 'success' : 'default'}
                      icon={<CertificateIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(material.overallStatus)}
                      size="small"
                      color={getStatusColor(material.overallStatus)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleView(material)} title="Görüntüle">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(material)} title="Düzenle">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(material.id)} title="Sil" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingMaterial ? 'Malzeme Kaydını Düzenle' : 'Yeni Malzeme Kaydı'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Auto-Integration Panel */}
            <Card sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', border: '2px solid #e3f2fd' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                      Malzeme Türü ve Standart Seçimi
                    </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                OTOMATIK ENTEGRASYON SİSTEMİ: Malzeme kategorisi → Alt kategori → Kalite → Standart seçin. Sistem kimyasal bileşim, sertlik değerleri ve mekanik özellikler
                için tüm spesifikasyonları otomatik yükler.
                    </Typography>
                    
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>1. Malzeme Kategorisi</InputLabel>
                            <Select
                              value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubCategory('');
                      setSelectedGrade('');
                      setSelectedStandard('');
                    }}
                              label="1. Malzeme Kategorisi"
                            >
                    {materialCategories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        
                          <FormControl fullWidth disabled={!selectedCategory}>
                            <InputLabel>2. Alt Kategori</InputLabel>
                            <Select
                              value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                      setSelectedGrade('');
                      setSelectedStandard('');
                    }}
                              label="2. Alt Kategori"
                            >
                    {getSubCategories().map((subCategory) => (
                                <MenuItem key={subCategory.id} value={subCategory.id}>
                                  {subCategory.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                      
                          <FormControl fullWidth disabled={!selectedSubCategory}>
                            <InputLabel>3. Malzeme Kalitesi</InputLabel>
                            <Select
                              value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedStandard('');
                    }}
                              label="3. Malzeme Kalitesi"
                            >
                    {getGrades().map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                  {grade.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        
                          <FormControl fullWidth disabled={!selectedGrade}>
                            <InputLabel>4. Standart</InputLabel>
                            <Select
                              value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                              label="4. Standart"
                            >
                    {getStandards().map((standard) => (
                                <MenuItem key={standard} value={standard}>
                                  {standard}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                      </Box>
                      
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {autoIntegrationReady ? (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                      ✓ Standart Hazır: {getGrades().find(g => g.id === selectedGrade)?.name} - {selectedStandard}
                    </span>
                  ) : (
                    <span style={{ color: '#9e9e9e' }}>
                      6 Kimyasal Element • 7 Mekanik Test • 1 Sertlik Testi
                    </span>
                  )}
                          </Typography>
                          
                            <Button
                              variant="contained"
                              color="success"
                              onClick={handleAutoIntegration}
                  disabled={!autoIntegrationReady}
                  startIcon={<CheckIcon />}
                  sx={{ minWidth: 200 }}
                            >
                              OTOMATIK ENTEGRE ET
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="secondary"
                  onClick={handleSpecificationsOnly}
                  disabled={!autoIntegrationReady}
                              startIcon={<DownloadIcon />}
                  sx={{ minWidth: 180 }}
                            >
                              Sadece Spesifikasyonları Yükle
                            </Button>
                          </Box>
            </Card>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label="Temel Bilgiler" />
              <Tab label="Kimyasal Analiz" />
              <Tab label="Mekanik Özellikler" />
              <Tab label="Sertifika Yönetimi" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                    <TextField
                      fullWidth
                  label="Malzeme Adı *"
                  value={formData.materialName || ''}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  placeholder="Örn: S355J2"
                />

                    <TextField
                      fullWidth
                  label="Tedarikçi *"
                  value={formData.supplier || ''}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Tedarikçi firma adı"
                />

                    <TextField
                      fullWidth
                  label="Parti Numarası"
                  value={formData.batchNumber || ''}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="Lot/Parti numarası"
                />

                    <TextField
                      fullWidth
                  label="Parça Numarası"
                  value={formData.partNumber || ''}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  placeholder="Part number"
                />

                    <TextField
                      fullWidth
                  label="Paket Numarası"
                  value={formData.packageNumber || ''}
                  onChange={(e) => setFormData({ ...formData, packageNumber: e.target.value })}
                  placeholder="Package number"
                />

                    <TextField
                      fullWidth
                  label="Döküm Numarası"
                  value={formData.castNumber || ''}
                  onChange={(e) => setFormData({ ...formData, castNumber: e.target.value })}
                  placeholder="Cast number"
                />

                <TextField
                  fullWidth
                  label="Sertifika Numarası"
                  value={formData.certificateNumber || ''}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  placeholder="Certificate number"
                />

                    <FormControl fullWidth>
                  <InputLabel>Sertifika Normu</InputLabel>
                      <Select
                    value={formData.certificateStandard || ''}
                    onChange={(e) => setFormData({ ...formData, certificateStandard: e.target.value })}
                    label="Sertifika Normu"
                  >
                    <MenuItem value="2.1">2.1 - Özel Test Raporu (Specific Test Report)</MenuItem>
                    <MenuItem value="2.2">2.2 - Ek Testli Özel Test Raporu (Specific Test Report with additional tests)</MenuItem>
                    <MenuItem value="3.1">3.1 - Uygunluk Sertifikası (Certificate of Compliance)</MenuItem>
                    <MenuItem value="3.2">3.2 - Test Sonuçlu Uygunluk Sertifikası (Certificate of Compliance with test results)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                  label="Sertifika Tarihi"
                  type="date"
                  value={formData.certificateDate || ''}
                  onChange={(e) => setFormData({ ...formData, certificateDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                    <TextField
                      fullWidth
                  label="Alım Tarihi"
                      type="date"
                  value={formData.receivedDate || ''}
                  onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                      fullWidth
                  label="Miktar"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />

                <FormControl fullWidth>
                  <InputLabel>Birim</InputLabel>
                  <Select
                    value={formData.unit || 'kg'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    label="Birim"
                  >
                    <MenuItem value="kg">kg</MenuItem>
                    <MenuItem value="ton">ton</MenuItem>
                    <MenuItem value="adet">adet</MenuItem>
                    <MenuItem value="m">metre</MenuItem>
                    <MenuItem value="m²">m²</MenuItem>
                    <MenuItem value="m³">m³</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>Kimyasal Bileşim</Typography>
              {formData.chemicalComposition && formData.chemicalComposition.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Element</TableCell>
                      <TableCell>Ölçülen (%)</TableCell>
                      <TableCell>Spesifikasyon</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      {formData.chemicalComposition.map((comp, index) => (
                      <TableRow key={index}>
                          <TableCell>{comp.element}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={comp.percentage}
                            onChange={(e) => {
                                const newComposition = [...formData.chemicalComposition!];
                              const newValue = parseFloat(e.target.value) || 0;
                                newComposition[index].percentage = newValue;
                                newComposition[index].status = getAutoStatus(newValue, comp.minValue, comp.maxValue);
                                setFormData({ ...formData, chemicalComposition: newComposition });
                              }}
                              inputProps={{ step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>{comp.specification}</TableCell>
                        <TableCell>
                          <Chip
                            label={comp.status}
                            size="small"
                              color={comp.status === 'KABUL' ? 'success' : comp.status === 'RET' ? 'error' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              ) : (
                  <Typography variant="body2" color="text.secondary">
                  Henüz kimyasal analiz verisi yok. Otomatik entegrasyon kullanın veya manuel veri girin.
                  </Typography>
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" sx={{ mb: 2 }}>Mekanik Özellikler</Typography>
              {formData.mechanicalProperties && formData.mechanicalProperties.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                        <TableCell>Özellik</TableCell>
                        <TableCell>Ölçülen Değer</TableCell>
                        <TableCell>Birim</TableCell>
                      <TableCell>Spesifikasyon</TableCell>
                        <TableCell>Test Metodu</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      {formData.mechanicalProperties.map((prop, index) => (
                      <TableRow key={index}>
                          <TableCell>{prop.property}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                              value={prop.value}
                            onChange={(e) => {
                                const newProperties = [...formData.mechanicalProperties!];
                              const newValue = parseFloat(e.target.value) || 0;
                                newProperties[index].value = newValue;
                                newProperties[index].status = getAutoStatus(newValue, prop.minValue, prop.maxValue);
                                setFormData({ ...formData, mechanicalProperties: newProperties });
                              }}
                          />
                        </TableCell>
                          <TableCell>{prop.unit}</TableCell>
                          <TableCell>{prop.specification}</TableCell>
                          <TableCell>{prop.testMethod}</TableCell>
                        <TableCell>
                          <Chip
                              label={prop.status}
                            size="small"
                              color={prop.status === 'KABUL' ? 'success' : prop.status === 'RET' ? 'error' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz mekanik test verisi yok. Otomatik entegrasyon kullanın veya manuel veri girin.
                </Typography>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>Sertifika Yönetimi</Typography>
              
              <Box sx={{ mb: 3 }}>
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="certificate-upload"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="certificate-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mr: 2 }}
                  >
                    Sertifika Yükle
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary">
                  PDF, JPG, JPEG, PNG formatları desteklenir (Maks. 10MB)
                </Typography>
              </Box>

              {formData.certificates && formData.certificates.length > 0 ? (
                <List>
                  {formData.certificates.map((cert) => (
                    <ListItem key={cert.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                      <ListItemIcon>
                        <CertificateIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={cert.fileName}
                        secondary={`${(cert.size / 1024 / 1024).toFixed(2)} MB • ${new Date(cert.uploadDate).toLocaleDateString('tr-TR')}`}
                      />
                      <IconButton onClick={() => handleDownloadCertificate(cert)} title="İndir">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCertificate(cert.id)} title="Sil" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                  <Typography variant="body2" color="text.secondary">
                  Henüz sertifika yüklenmemiş.
                  </Typography>
                )}
            </TabPanel>
              </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingMaterial ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Malzeme Detayları: {selectedMaterial?.materialName}
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Temel Bilgiler</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                <Typography><strong>Malzeme:</strong> {selectedMaterial.materialName}</Typography>
                <Typography><strong>Tedarikçi:</strong> {selectedMaterial.supplier}</Typography>
                <Typography><strong>Parti No:</strong> {selectedMaterial.batchNumber}</Typography>
                <Typography><strong>Standart:</strong> {selectedMaterial.standard}</Typography>
                <Typography><strong>Sertifika Normu:</strong> {selectedMaterial.certificateStandard}</Typography>
              </Box>

              <Typography variant="h6" gutterBottom>Kimyasal Bileşim</Typography>
              {selectedMaterial.chemicalComposition.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                        <TableCell>Element</TableCell>
                        <TableCell>Ölçülen (%)</TableCell>
                      <TableCell>Spesifikasyon</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      {selectedMaterial.chemicalComposition.map((comp, index) => (
                      <TableRow key={index}>
                          <TableCell>{comp.element}</TableCell>
                          <TableCell>{comp.percentage}%</TableCell>
                          <TableCell>{comp.specification}</TableCell>
                        <TableCell>
                          <Chip
                              label={comp.status}
                            size="small"
                              color={comp.status === 'KABUL' ? 'success' : comp.status === 'RET' ? 'error' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Kimyasal analiz verisi yok.
                </Typography>
              )}

              <Typography variant="h6" gutterBottom>Sertifikalar</Typography>
              {selectedMaterial.certificates.length > 0 ? (
              <List>
                  {selectedMaterial.certificates.map((cert) => (
                    <ListItem key={cert.id}>
                    <ListItemIcon>
                      <CertificateIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={cert.fileName}
                        secondary={`${(cert.size / 1024 / 1024).toFixed(2)} MB • ${new Date(cert.uploadDate).toLocaleDateString('tr-TR')}`}
                    />
                      <IconButton onClick={() => handleViewCertificate(cert)} title="Görüntüle">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownloadCertificate(cert)} title="İndir">
                      <DownloadIcon />
                    </IconButton>
                  </ListItem>
                ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sertifika yok.
                  </Typography>
                )}
          </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default MaterialCertificateTracking;
