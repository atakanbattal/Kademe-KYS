import React, { useState, useMemo, useRef, memo, useCallback, useEffect } from 'react';
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
  Error as ErrorIcon,
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';
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
  status: 'active' | 'inactive' | 'maintenance' | 'calibration' | 'out_of_service';
  calibrationRequired: boolean;
  calibrationFrequency: number; // months
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationStatus: 'valid' | 'due' | 'overdue' | 'invalid';
  maintenanceRequired: boolean;
  maintenanceFrequency: number; // months
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceStatus: 'good' | 'due' | 'overdue' | 'critical';
  criticalEquipment: boolean;
  specifications: string;
  operatingManual: string;
  notes: string;
  qrCode?: string;
  images: string[];
  certificates: CalibrationCertificate[];
  maintenanceRecords: MaintenanceRecord[];
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
  certificateFile: string;
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

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceDate: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  description: string;
  performedBy: string;
  partsReplaced: string[];
  nextMaintenanceDate: string;
  workOrderNumber: string;
  duration: number; // hours
  status: 'completed' | 'pending' | 'in_progress' | 'cancelled';
  notes: string;
  attachments: string[];
}

// Interfaces removed - not currently used in the component

interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  department: string;
  status: string;
  calibrationStatus: string;
  maintenanceStatus: string;
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
  'Test Sahası',
  'Tesellüm',
  'Torna'
];

const DEPARTMENTS = [
  'Ar-Ge',
  'Girdi Kalite Kontrol',
  'Proses Kalite Kontrol', 
  'Final Kalite Kontrol',
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
  'Güvenlik'
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
    { id: '12', sicilNo: '012', name: 'Osman Polat', department: 'Depo', position: 'Depo Sorumlusu', email: 'osman.polat@kademe.com', phone: '0532 234 5678', isActive: true }
  ];
  
  localStorage.setItem('personnel_data', JSON.stringify(samplePersonnel));
  return samplePersonnel;
};

// Dinamik ölçüm aralıkları - cihaz kategorisine göre
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
      '125-150 mm', '150-175 mm', '175-200 mm', '0-50 mm', '0-100 mm', 
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm', 
      '0-2000 mm', 'Diğer'
    ],

    'Test Ekipmanları': [
      '0-10 V', '0-100 V', '0-1000 V', '0-10 A', '0-100 A', 
      '0-1000 A', '0-1 kHz', '0-100 kHz', '0-1 MHz', 'Diğer'
    ],
    'Üretim Makineleri': [
      '0-100 kN', '0-500 kN', '0-1000 kN', '0-5000 kN',
      '0-100 Nm', '0-500 Nm', '0-1000 Nm', 'Diğer'
    ],
    'Kalite Kontrol Cihazları': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '125-150 mm', '150-175 mm', '175-200 mm', '0-50 mm', '0-100 mm', 
      '0-200 mm', '0-500 mm', '0-1000 mm', 'Diğer'
    ],
    'Kaynak Ekipmanları': [
      '0-300 A', '0-500 A', '0-1000 A', '10-50 V',
      '20-80 V', '0-100%', 'Diğer'
    ],
    'Elektrikli Cihazlar': [
      '0-12 V', '0-24 V', '0-110 V', '0-220 V', '0-380 V',
      '0-1000 V', '0-10 A', '0-100 A', '0-1000 A', 'Diğer'
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

const EquipmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 28px rgba(0, 0, 0, 0.15)`,
    borderColor: theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const StatusChip = styled(Chip)<{ statustype: string }>(({ theme, statustype }) => {
  const getStatusColor = () => {
    switch (statustype) {
      case 'valid':
      case 'active':
      case 'good':
      case 'pass':
        return { bg: theme.palette.success.main, color: theme.palette.success.contrastText };
      case 'due':
      case 'pending':
        return { bg: theme.palette.warning.main, color: theme.palette.warning.contrastText };
      case 'overdue':
      case 'invalid':
      case 'fail':
      case 'critical':
        return { bg: theme.palette.error.main, color: theme.palette.error.contrastText };
      case 'inactive':
      case 'maintenance':
        return { bg: theme.palette.grey[500], color: theme.palette.grey[50] };
      default:
        return { bg: theme.palette.primary.main, color: theme.palette.primary.contrastText };
    }
  };

  const colors = getStatusColor();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: colors.color,
    },
  };
});

// 🎯 BALANCED STABLE SEARCH INPUT - Tıklanabilir ve focus korumalı
const UltimateStableSearchInput = memo<{
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}>(({ defaultValue = '', onChange, placeholder = "", label = "", size = "small", fullWidth = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isAliveRef = useRef(true);
  const lastUserActionRef = useRef(Date.now());
  const focusProtectionRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🎯 BALANCED FOCUS PROTECTION - Hem tıklanabilir hem korumalı
  useEffect(() => {
    let focusInterval: NodeJS.Timeout;
    
    const balancedFocusProtection = () => {
      if (!isAliveRef.current || !inputRef.current) return;
      
      const input = inputRef.current;
      
      // Focus kaybolmuşsa geri al - ZAman sınırı olmadan
      if (document.activeElement !== input) {
        // Sadece başka bir input'a focus olunmamışsa
        const activeElement = document.activeElement;
        if (!activeElement || activeElement.tagName !== 'INPUT') {
          try {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          } catch (e) {
            // Silent fail
          }
        }
      }
    };
    
    // Her 100ms kontrol et - daha yumuşak
    focusInterval = setInterval(balancedFocusProtection, 100);
    
    return () => {
      clearInterval(focusInterval);
    };
  }, []);
  
  // 🎯 SMART DOM EVENT HANDLING 
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      
      lastUserActionRef.current = Date.now();
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        if (isAliveRef.current) {
          onChange(value);
        }
      }, 200);
    };
    
    const handleFocus = () => {
      lastUserActionRef.current = Date.now();
    };
    
    const handleClick = (event: Event) => {
      lastUserActionRef.current = Date.now();
      // Normal click behavior'ı koru
    };
    
    const handleKeyDown = () => {
      lastUserActionRef.current = Date.now();
    };
    
    const handleBlur = (event: FocusEvent) => {
      // Sadece container dışına blur oluyorsa engelle
      const relatedTarget = event.relatedTarget as Element;
      if (!containerRef.current?.contains(relatedTarget)) {
        // 50ms bekle, zaman sınırı olmadan focus'u geri al
        setTimeout(() => {
          if (isAliveRef.current && input) {
            input.focus();
          }
        }, 50);
      }
    };
    
    // Event listener'ları ekle
    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('click', handleClick);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('blur', handleBlur);
    
    return () => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('click', handleClick);
      input.removeEventListener('keydown', handleKeyDown);
      input.removeEventListener('blur', handleBlur);
    };
  }, [onChange]);
  
  // 🎯 CONTAINER INTERACTION
  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    // Sadece container'a tıklanırsa input'a focus ver
    if (event.target === containerRef.current && inputRef.current) {
      lastUserActionRef.current = Date.now();
      inputRef.current.focus();
    }
  }, []);
  
  // 🎯 CLEANUP
  useEffect(() => {
    isAliveRef.current = true;
    
    return () => {
      isAliveRef.current = false;
      if (focusProtectionRef.current) clearTimeout(focusProtectionRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      style={{ 
        width: fullWidth ? '100%' : 'auto',
        position: 'relative'
      }}
    >
      <TextField
        ref={inputRef}
        fullWidth={fullWidth}
        size={size}
        label={label}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: '#1976d2 !important',
                borderWidth: '2px !important',
              },
            },
          },
        }}
      />
    </div>
  );
}, () => true); // Memo lock

const EquipmentCalibrationManagement: React.FC = () => {
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
  const [expanded, setExpanded] = useState<string | false>('filters');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | 'calibration' | 'maintenance'>('create');
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
    maintenanceStatus: '',
    responsiblePerson: '',
    dateRange: {
      start: '',
      end: ''
    },
    criticalOnly: false,
    overdueOnly: false
  });

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
    maintenanceRequired: true,
    maintenanceFrequency: 6,
    criticalEquipment: false,
    specifications: '',
    notes: '',
    measurementRange: '',
    measurementUncertainty: ''
  });

  // Equipment data - localStorage'dan yüklenir
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const stored = localStorage.getItem('equipment_calibration_data');
    return stored ? JSON.parse(stored) : [];
  });

  // Personnel data
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => getPersonnelData());

  // Component mount edildiğinde localStorage verilerini güncelle
  useEffect(() => {
    // Ölçüm aralıklarını güncelle
    const updatedRanges = getMeasurementRangesByCategory();
    setMeasurementRanges(updatedRanges);
    
    // Ölçüm belirsizliklerini güncelle
    const updatedUncertainties = getMeasurementUncertaintiesByCategory();
    setMeasurementUncertainties(updatedUncertainties);
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

  // Yeni eklenen state'ler - Dinamik yönetim için
  const [manufacturersList, setManufacturersList] = useState<string[]>(() => getManufacturers());
  const [modelsList, setModelsList] = useState<string[]>(() => getModels());
  const [calibrationCompaniesList, setCalibrationCompaniesList] = useState<string[]>(() => getCalibrationCompanies());
  
  // Ölçüm aralığı ve belirsizlik verileri
  const [measurementRanges, setMeasurementRanges] = useState<any>(() => getMeasurementRangesByCategory());
  const [measurementUncertainties, setMeasurementUncertainties] = useState<any>(() => getMeasurementUncertaintiesByCategory());
  
  // Dialog state'leri
  const [openManufacturerDialog, setOpenManufacturerDialog] = useState(false);
  const [openManufacturerManagementDialog, setOpenManufacturerManagementDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [openModelManagementDialog, setOpenModelManagementDialog] = useState(false);
  const [openCalibrationCompanyDialog, setOpenCalibrationCompanyDialog] = useState(false);
  
  // Ölçüm yönetimi dialog state'leri
  const [openMeasurementRangeManagementDialog, setOpenMeasurementRangeManagementDialog] = useState(false);
  const [openMeasurementUncertaintyManagementDialog, setOpenMeasurementUncertaintyManagementDialog] = useState(false);
  
  // Yeni ekleme için input state'leri
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCalibrationCompany, setNewCalibrationCompany] = useState('');
  const [newMeasurementRange, setNewMeasurementRange] = useState('');
  const [newMeasurementUncertainty, setNewMeasurementUncertainty] = useState('');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const filteredEquipment = equipmentList.filter(equipment => {
      if (filters.searchTerm && !equipment.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !equipment.equipmentCode.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.category && equipment.category !== filters.category) return false;
      if (filters.location && equipment.location !== filters.location) return false;
      if (filters.department && equipment.department !== filters.department) return false;
      if (filters.status && equipment.status !== filters.status) return false;
      if (filters.calibrationStatus && equipment.calibrationStatus !== filters.calibrationStatus) return false;
      if (filters.maintenanceStatus && equipment.maintenanceStatus !== filters.maintenanceStatus) return false;
      if (filters.responsiblePerson && !equipment.responsiblePersons.includes(filters.responsiblePerson)) return false;
      if (filters.criticalOnly && !equipment.criticalEquipment) return false;
      if (filters.overdueOnly && equipment.calibrationStatus !== 'overdue' && equipment.maintenanceStatus !== 'overdue') return false;
      return true;
    });

    const totalEquipment = filteredEquipment.length;
    const activeEquipment = filteredEquipment.filter(eq => eq.status === 'active').length;
    const criticalEquipment = filteredEquipment.filter(eq => eq.criticalEquipment).length;
    const calibrationDue = filteredEquipment.filter(eq => eq.calibrationStatus === 'due' || eq.calibrationStatus === 'overdue').length;
    const maintenanceDue = filteredEquipment.filter(eq => eq.maintenanceStatus === 'due' || eq.maintenanceStatus === 'overdue').length;

    // Status distribution for charts
    const statusDistribution = [
      { name: 'Aktif', value: filteredEquipment.filter(eq => eq.status === 'active').length, color: '#4caf50' },
      { name: 'Bakımda', value: filteredEquipment.filter(eq => eq.status === 'maintenance').length, color: '#ff9800' },
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
      maintenanceDue,
      statusDistribution,
      calibrationStatusDistribution,
      categoryDistribution,
      filteredEquipment
    };
  }, [equipmentList, filters]);

  const openCreateDialog = () => {
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
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      criticalEquipment: false,
      specifications: '',
      notes: '',
      measurementRange: '',
      measurementUncertainty: ''
    });
    setActiveStep(0);
    setOpenDialog(true);
  };

  // ✅ İşlem butonları için fonksiyonlar eklendi
  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('view');
    setDialogTitle(`${equipment.name} - Detaylar`);
    setOpenDialog(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
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
      maintenanceRequired: equipment.maintenanceRequired,
      maintenanceFrequency: equipment.maintenanceFrequency,
      lastMaintenanceDate: equipment.lastMaintenanceDate,
      nextMaintenanceDate: equipment.nextMaintenanceDate,
      maintenanceStatus: equipment.maintenanceStatus,
      criticalEquipment: equipment.criticalEquipment,
      specifications: equipment.specifications,
      operatingManual: equipment.operatingManual,
      notes: equipment.notes,
      qrCode: equipment.qrCode,
      images: equipment.images || [],
      certificates: equipment.certificates || [],
      maintenanceRecords: equipment.maintenanceRecords || [],
      measurementRange: equipment.measurementRange,
      measurementUncertainty: equipment.measurementUncertainty,
      customMeasurementRange: equipment.customMeasurementRange,
      customMeasurementUncertainty: equipment.customMeasurementUncertainty,
      calibrationCompany: equipment.calibrationCompany,
      lastCalibrationCertificateNumber: equipment.lastCalibrationCertificateNumber,
      responsiblePersonName: equipment.responsiblePersonName,
      responsiblePersonSicilNo: equipment.responsiblePersonSicilNo
    });
    setDialogMode('edit');
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCalibration = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('calibration');
    setDialogTitle(`Kalibrasyon İşlemi - ${equipment.name}`);
    setOpenDialog(true);
  };

  const handleMaintenance = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('maintenance');
    setDialogTitle(`Bakım İşlemi - ${equipment.name}`);
    setOpenDialog(true);
  };

  const handleDeleteEquipment = (equipment: Equipment) => {
    if (window.confirm(`"${equipment.name}" ekipmanını silmek istediğinize emin misiniz?`)) {
      setEquipmentList(prevList => prevList.filter(eq => eq.id !== equipment.id));
      // Success notification can be added here
      console.log(`${equipment.name} ekipmanı silindi`);
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
      case 'maintenance':
        return <BuildIcon />;
      case 'calibration':
        return <ScienceIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Yeni personel kaydetme fonksiyonu
  const handleSavePersonnel = () => {
    if (!newPersonnelData.sicilNo || !newPersonnelData.name || !newPersonnelData.department) {
      alert('Sicil No, Ad Soyad ve Departman alanları zorunludur!');
      return;
    }

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
    
    // LocalStorage'a kaydet
    localStorage.setItem('personnel_data', JSON.stringify(updatedPersonnelList));

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
      updatedRanges[formData.category] = [...(updatedRanges[formData.category] || []), range];
      setMeasurementRanges(updatedRanges);
      localStorage.setItem('measurement_ranges_by_category', JSON.stringify(updatedRanges));
      
      setNewMeasurementRange('');
      setOpenMeasurementRangeManagementDialog(false);
    }
  };

  const handleDeleteMeasurementRange = (range: string) => {
    if (formData.category) {
      const updatedRanges = {...measurementRanges};
      updatedRanges[formData.category] = updatedRanges[formData.category].filter((r: string) => r !== range);
      setMeasurementRanges(updatedRanges);
      localStorage.setItem('measurement_ranges_by_category', JSON.stringify(updatedRanges));
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
      updatedUncertainties[formData.category] = [...(updatedUncertainties[formData.category] || []), uncertainty];
      setMeasurementUncertainties(updatedUncertainties);
      localStorage.setItem('measurement_uncertainties_by_category', JSON.stringify(updatedUncertainties));
      
      setNewMeasurementUncertainty('');
      setOpenMeasurementUncertaintyManagementDialog(false);
    }
  };

  const handleDeleteMeasurementUncertainty = (uncertainty: string) => {
    if (formData.category) {
      const updatedUncertainties = {...measurementUncertainties};
      updatedUncertainties[formData.category] = updatedUncertainties[formData.category].filter((u: string) => u !== uncertainty);
      setMeasurementUncertainties(updatedUncertainties);
      localStorage.setItem('measurement_uncertainties_by_category', JSON.stringify(updatedUncertainties));
    }
  };

  // Form kaydetme fonksiyonu
  const handleSave = () => {
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
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maintenanceStatus: 'good',
      criticalEquipment: formData.criticalEquipment || false,
      specifications: formData.specifications || '',
      operatingManual: '',
      notes: formData.notes || '',
      images: [],
      certificates: [],
      maintenanceRecords: [],
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
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedList));
    } else {
      // Yeni ekleme
      const updatedList = [...equipmentList, newEquipment];
      setEquipmentList(updatedList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedList));
    }

    // Dialog'u kapat ve formu temizle
    setOpenDialog(false);
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
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      criticalEquipment: false,
      specifications: '',
      notes: ''
    });
    setSelectedPersonnel([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          size="large"
        >
          Yeni Ekipman
        </Button>
      </Box>

      {/* TÜM MODÜL İÇİN GLOBAL FİLTRELER */}
      <StyledAccordion
        expanded={expanded === 'filters'}
        onChange={handleAccordionChange('filters')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: '#ffffff' }} />
                          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Filtreler ve Arama</Typography>
            {Object.values(filters).some(v => v !== '' && !(typeof v === 'object' && !v.start && !v.end) && v !== false) && (
              <Badge color="primary" variant="dot" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56 }}>
              <UltimateStableSearchInput
                label="Ekipman Arama"
                placeholder="Ekipman adı veya kodu ile arayın..."
                defaultValue={filters.searchTerm}
                onChange={(value: string) => handleFilterChange('searchTerm', value)}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth sx={{ height: 56 }}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  sx={{ height: 56 }}
                >
                  <MenuItem value="">Tüm Kategoriler</MenuItem>
                  {EQUIPMENT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56 }}>
              <FormControl fullWidth sx={{ height: 56 }}>
                <InputLabel>Lokasyon</InputLabel>
                <Select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  sx={{ height: 56 }}
                >
                  <MenuItem value="">Tüm Lokasyonlar</MenuItem>
                  {LOCATIONS.map((location) => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56 }}>
              <FormControl fullWidth sx={{ height: 56 }}>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  sx={{ height: 56 }}
                >
                  <MenuItem value="">Tüm Departmanlar</MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56 }}>
              <FormControl fullWidth sx={{ height: 56 }}>
                <InputLabel>Kalibrasyon Durumu</InputLabel>
                <Select
                  value={filters.calibrationStatus}
                  onChange={(e) => handleFilterChange('calibrationStatus', e.target.value)}
                  sx={{ height: 56 }}
                >
                  <MenuItem value="">Tüm Durumlar</MenuItem>
                  <MenuItem value="valid">Geçerli</MenuItem>
                  <MenuItem value="due">Vadesi Yaklaşan</MenuItem>
                  <MenuItem value="overdue">Vadesi Geçen</MenuItem>
                  <MenuItem value="invalid">Geçersiz</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56, display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.criticalOnly}
                    onChange={(e) => handleFilterChange('criticalOnly', e.target.checked)}
                  />
                }
                label="Sadece Kritik Ekipmanlar"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56, display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.overdueOnly}
                    onChange={(e) => handleFilterChange('overdueOnly', e.target.checked)}
                  />
                }
                label="Sadece Vadesi Geçenler"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px', height: 56 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setFilters({
                  searchTerm: '',
                  category: '',
                  location: '',
                  department: '',
                  status: '',
                  calibrationStatus: '',
                  maintenanceStatus: '',
                  responsiblePerson: '',
                  dateRange: { start: '', end: '' },
                  criticalOnly: false,
                  overdueOnly: false
                })}
                sx={{ height: 56 }}
              >
                Filtreleri Temizle
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </StyledAccordion>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<DashboardIcon />} />
        <Tab label="Ekipman Listesi" icon={<EngineeringIcon />} />
        <Tab label="Kalibrasyon Takibi" icon={<ScienceIcon />} />
        <Tab label="Bakım Takibi" icon={<BuildIcon />} />
        <Tab label="Planlar ve Uyarılar" icon={<ScheduleIcon />} />
        <Tab label="Raporlar" icon={<AssessmentIcon />} />
      </Tabs>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Box>

          {/* Özet Kartları */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {metrics.maintenanceDue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bakım Gerekli
                      </Typography>
                    </Box>
                    <BuildIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </EquipmentCard>
            </Box>
          </Box>

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
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              overflow: 'auto',
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: '60vh',
              minHeight: '400px',
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
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '120px',
                      minWidth: '120px'
                    }}
                  >
                    Kod / Kritik
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '200px',
                      minWidth: '200px'
                    }}
                  >
                    Ekipman Bilgileri
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '140px',
                      minWidth: '140px'
                    }}
                  >
                    Lokasyon
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '140px',
                      minWidth: '140px'
                    }}
                  >
                    Zimmet / Sorumlu
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '180px',
                      minWidth: '180px'
                    }}
                  >
                    Ölçüm Aralığı / Belirsizlik
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '100px',
                      minWidth: '100px'
                    }}
                  >
                    Durum
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '150px',
                      minWidth: '150px'
                    }}
                  >
                    Kalibrasyon
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '150px',
                      minWidth: '150px'
                    }}
                  >
                    Bakım
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '160px',
                      minWidth: '160px'
                    }}
                  >
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.filteredEquipment.map((equipment, index) => (
                  <TableRow 
                    key={equipment.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? 'background.default' : 'grey.50',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                        transform: 'scale(1.002)',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                      },
                      height: '64px'
                    }}
                  >
                    <TableCell sx={{ padding: '8px', borderLeft: equipment.criticalEquipment ? '4px solid #f44336' : '4px solid transparent' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                          {equipment.equipmentCode}
                        </Typography>
                        {equipment.criticalEquipment && (
                          <Chip 
                            label="KRİTİK" 
                            color="error" 
                            size="small" 
                            sx={{ 
                              height: '16px', 
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              '& .MuiChip-label': { padding: '0 4px' }
                            }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title={equipment.name} placement="top">
                          <Typography 
                            variant="body2" 
                            fontWeight={500}
                            sx={{ 
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px'
                            }}
                          >
                            {equipment.name}
                          </Typography>
                        </Tooltip>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.65rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px'
                          }}
                        >
                          {equipment.manufacturer} {equipment.model}
                        </Typography>
                        <Chip 
                          label={equipment.category} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            height: '18px', 
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { padding: '0 4px' }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}
                        >
                          {equipment.location}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.65rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}
                        >
                          {equipment.department}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                          fontWeight={600}
                        sx={{ 
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                            maxWidth: '120px',
                            color: 'primary.main'
                        }}
                      >
                          {equipment.responsiblePersonName || 'Belirtilmemiş'}
                      </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.65rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}
                        >
                          Sicil: {equipment.responsiblePersonSicilNo || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title={equipment.measurementRange || 'Belirtilmemiş'} placement="top">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '160px',
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
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px'
                          }}
                        >
                          ± {equipment.measurementUncertainty || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <StatusChip
                        label={
                          equipment.status === 'active' ? 'Aktif' :
                          equipment.status === 'maintenance' ? 'Bakımda' :
                          equipment.status === 'calibration' ? 'Kalibrasyon' :
                          equipment.status === 'inactive' ? 'Pasif' : 'Devre Dışı'
                        }
                        statustype={equipment.status}
                        size="small"
                        icon={getStatusIcon(equipment.status)}
                        sx={{ 
                          height: '24px',
                          fontSize: '0.65rem',
                          '& .MuiChip-label': { padding: '0 6px' },
                          '& .MuiChip-icon': { fontSize: '12px' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
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
                            height: '20px',
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { padding: '0 4px' },
                            '& .MuiChip-icon': { fontSize: '10px' }
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: '0.6rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDate(equipment.nextCalibrationDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <StatusChip
                          label={
                            equipment.maintenanceStatus === 'good' ? 'İyi' :
                            equipment.maintenanceStatus === 'due' ? 'Yaklaşan' :
                            equipment.maintenanceStatus === 'overdue' ? 'Geciken' : 'Kritik'
                          }
                          statustype={equipment.maintenanceStatus}
                          size="small"
                          icon={getStatusIcon(equipment.maintenanceStatus)}
                          sx={{ 
                            height: '20px',
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { padding: '0 4px' },
                            '& .MuiChip-icon': { fontSize: '10px' }
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: '0.6rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDate(equipment.nextMaintenanceDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
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
                        <Tooltip title="Bakım">
                          <IconButton 
                            size="small"
                            onClick={() => handleMaintenance(equipment)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': { 
                                backgroundColor: 'info.50',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <BuildIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
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
                ))}
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
          


          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Kalibrasyonlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Kalibrasyonlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.calibrationStatus === 'due')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
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
                              Tarih: {formatDate(equipment.nextCalibrationDate)} 
                              ({getDaysUntilDue(equipment.nextCalibrationDate)} gün kaldı)
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
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  Vadesi Geçen Kalibrasyonlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.calibrationStatus === 'overdue')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
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
                              Vadesi: {formatDate(equipment.nextCalibrationDate)} 
                              ({Math.abs(getDaysUntilDue(equipment.nextCalibrationDate))} gün geçmiş)
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

      {/* Bakım Takibi Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>Bakım Takip Sistemi</Typography>
          


          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Bakımlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Bakımlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.maintenanceStatus === 'due')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <BuildIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={equipment.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Kod: {equipment.equipmentCode}
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                              Tarih: {formatDate(equipment.nextMaintenanceDate)} 
                              ({getDaysUntilDue(equipment.nextMaintenanceDate)} gün kaldı)
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="outlined" size="small" startIcon={<BuildIcon />}>
                        Bakım Planla
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            {/* Vadesi Geçen Bakımlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  Vadesi Geçen Bakımlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.maintenanceStatus === 'overdue')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
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
                              Vadesi: {formatDate(equipment.nextMaintenanceDate)} 
                              ({Math.abs(getDaysUntilDue(equipment.nextMaintenanceDate))} gün geçmiş)
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="contained" color="error" size="small" startIcon={<UrgentIcon />}>
                        Acil Bakım
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
                {metrics.maintenanceDue > 0 && (
                  <Alert severity="info" sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2">
                      <strong>{metrics.maintenanceDue}</strong> ekipmanın bakımı yaklaşıyor!
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
                        primary={`${metrics.maintenanceDue} Bakım İşlemi`}
                        secondary={`${metrics.maintenanceDue > 0 ? 'Vadesi yaklaşan bakımlar' : 'Planlanan bakım yok'}`}
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
                        secondary={`${metrics.filteredEquipment.filter(eq => eq.maintenanceStatus === 'good').length} iyi durumda, ${metrics.filteredEquipment.filter(eq => eq.maintenanceStatus === 'due').length} bakım gerekli, ${metrics.filteredEquipment.filter(eq => eq.maintenanceStatus === 'critical').length} kritik`}
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
          onClose={(event, reason) => {
            // Sadece 'escapeKeyDown' ve 'backdropClick' dışındaki durumlarda kapat
            if (reason !== 'escapeKeyDown' && reason !== 'backdropClick') {
              setOpenDialog(false);
            }
          }} 
          maxWidth="lg" 
          fullWidth
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
               dialogMode === 'calibration' ? 'Kalibrasyon Kaydı' :
               dialogMode === 'maintenance' ? 'Bakım Kaydı' : 'Ekipman Detayları'}
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
                      onChange={(e) => setFormData({...formData, equipmentCode: e.target.value})}
                      required
                      error={!formData.equipmentCode?.trim()}
                      helperText={!formData.equipmentCode?.trim() ? "Ekipman kodu zorunludur" : ""}
                      placeholder="EQ-001, MEAS-001, CAL-001"
                    />
                    <TextField
                      fullWidth
                      label="Cihazın Adı"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      error={!formData.name?.trim()}
                      helperText={!formData.name?.trim() ? "Cihaz adı zorunludur" : ""}
                      placeholder="Dijital Kumpas, Mikrometre, Test Cihazı"
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Seri Numarası"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    required
                    error={!formData.serialNumber?.trim()}
                    helperText={!formData.serialNumber?.trim() ? "Seri numarası zorunludur" : ""}
                    placeholder="ABC123456, SN-789456123"
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                    <Autocomplete
                      options={EQUIPMENT_CATEGORIES}
                      value={formData.category || ''}
                      onChange={(_, newValue) => {
                        setFormData({
                          ...formData, 
                          category: newValue || '',
                          measurementRange: '',
                          measurementUncertainty: ''
                        });
                      }}
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
                    
                    <Autocomplete
                      options={LOCATIONS}
                      value={formData.location || ''}
                      onChange={(_, newValue) => setFormData({...formData, location: newValue || ''})}
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
                    
                    <Autocomplete
                      options={DEPARTMENTS}
                      value={formData.department || ''}
                      onChange={(_, newValue) => setFormData({...formData, department: newValue || ''})}
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
                          onChange={(_, newValue) => setFormData({...formData, manufacturer: newValue || ''})}
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
                      
                      {/* Üretici Arama */}
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Üretici ara veya yönet..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                size="small" 
                                onClick={() => setOpenManufacturerManagementDialog(true)}
                                title="Üretici yönet"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: 'info.50',
                            '&:hover': { bgcolor: 'info.100' }
                          }
                        }}
                      />
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
                      
                      {/* Model Arama */}
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Model ara veya yönet..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                size="small" 
                                onClick={() => setOpenModelManagementDialog(true)}
                                title="Model yönet"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: 'info.50',
                            '&:hover': { bgcolor: 'info.100' }
                          }
                        }}
                      />
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
                          options={formData.category ? (measurementRanges[formData.category] || measurementRanges['Diğer'] || []) : []}
                          value={formData.measurementRange || ''}
                          onChange={(_, newValue) => setFormData({...formData, measurementRange: newValue || ''})}
                          disabled={!formData.category}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Ölçüm Aralığı *"
                              placeholder="Ölçüm aralığı ara..."
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
                          filterOptions={(options, params) => {
                            const inputValue = params.inputValue.toLowerCase().trim();
                            if (!inputValue) return options;
                            
                            return options.filter((option: string) => {
                              const optionLower = option.toLowerCase();
                              return optionLower.includes(inputValue) || 
                                     optionLower.startsWith(inputValue) || 
                                     optionLower.indexOf(inputValue) !== -1;
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
                          options={formData.category ? (measurementUncertainties[formData.category] || measurementUncertainties['Diğer'] || []) : []}
                          value={formData.measurementUncertainty || ''}
                          onChange={(_, newValue) => setFormData({...formData, measurementUncertainty: newValue || ''})}
                          disabled={!formData.category}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Ölçüm Belirsizliği *"
                              placeholder="Ölçüm belirsizliği ara..."
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
                          filterOptions={(options, params) => {
                            const inputValue = params.inputValue.toLowerCase().trim();
                            if (!inputValue) return options;
                            
                            return options.filter((option: string) => {
                              const optionLower = option.toLowerCase();
                              return optionLower.includes(inputValue) || 
                                     optionLower.startsWith(inputValue) || 
                                     optionLower.indexOf(inputValue) !== -1;
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
                      onChange={(e) => setFormData({...formData, lastCalibrationDate: e.target.value})}
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
                        const lastDate = new Date(formData.lastCalibrationDate || new Date());
                        const nextDate = new Date(lastDate);
                        nextDate.setMonth(nextDate.getMonth() + months);
                        setFormData({
                          ...formData, 
                          calibrationFrequency: months,
                          nextCalibrationDate: nextDate.toISOString().split('T')[0]
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
                      
                      {/* Laboratuvar Arama */}
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Laboratuvar ara veya yönet..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                size="small" 
                                onClick={() => setOpenCalibrationCompanyDialog(true)}
                                title="Laboratuvar yönet"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: 'secondary.50',
                            '&:hover': { bgcolor: 'secondary.100' }
                          }
                        }}
                      />
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
            <Box sx={{ p: 3 }}>
              <Typography>Görüntüleme modu - Ekipman detayları burada gösterilecek</Typography>
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
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon color="primary" />
            Yeni Personel Ekle
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
          <Button onClick={() => setOpenPersonnelDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSavePersonnel}
            startIcon={<SaveIcon />}
          >
            Personel Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Personel Yönetimi Dialog'u */}
      <Dialog 
        open={openPersonnelManagementDialog} 
        onClose={() => setOpenPersonnelManagementDialog(false)}
        maxWidth="md"
        fullWidth
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