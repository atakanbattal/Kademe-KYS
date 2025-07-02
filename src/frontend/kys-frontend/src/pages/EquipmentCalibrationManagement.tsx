import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
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
// Alt kategoriye göre ölçüm aralıkları
const getMeasurementRangesBySubCategory = () => {
  const stored = localStorage.getItem('measurement_ranges_by_sub_category');
  const version = localStorage.getItem('measurement_ranges_version');
  // Versiyon kontrolü - Yeni cihazlar eklendiğinde cache'i yenile
  if (stored && version === '2.0') {
    return JSON.parse(stored);
  }
  
  const defaultRanges = {
    // Kumpas Çeşitleri - Çok Detaylı
    'Kumpas - Digital': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-600 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-100 mm', '0-125 mm', '0-160 mm', '0-250 mm', '0-400 mm', '0-800 mm', '0-1200 mm',
      // İnç Ölçümler
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch', '0-24 inch', '0-40 inch', '0-60 inch',
      // Özel Aralıklar
      '10-50 mm', '20-100 mm', '50-200 mm', '100-500 mm'
    ],
    'Kumpas - Analog': ['0-150 mm', '0-200 mm', '0-300 mm', '0-125 mm', '0-6 inch', '0-8 inch'],
    'Kumpas - Abaküs': ['0-150 mm', '0-200 mm', '0-300 mm', '0-125 mm', '0-6 inch'],
    'Kumpas - İç Çap': [
      '10-150 mm', '50-200 mm', '100-300 mm', '200-500 mm', '300-800 mm', '500-1200 mm',
      '5-30 mm', '20-100 mm', '80-250 mm', '150-400 mm',
      '0.5-6 inch', '2-10 inch', '4-20 inch', '8-40 inch'
    ],
    'Kumpas - Dış Çap': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-800 mm', '0-1200 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch', '0-40 inch'
    ],
    'Kumpas - Derinlik': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-600 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch'
    ],
    'Kumpas - Yükseklik': [
      '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-8 inch', '0-12 inch', '0-20 inch', '0-40 inch', '0-60 inch', '0-80 inch'
    ],

    // Mikrometre Çeşitleri - Son Derece Detaylı
    'Mikrometre - Dış Çap': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm', '125-150 mm', 
      '150-175 mm', '175-200 mm', '200-225 mm', '225-250 mm', '250-275 mm', '275-300 mm', 
      '300-325 mm', '325-350 mm', '350-375 mm', '375-400 mm', '400-425 mm', '425-450 mm',
      '450-475 mm', '475-500 mm', '500-600 mm', '600-700 mm', '700-800 mm', '800-900 mm', '900-1000 mm',
      // İnç Ölçümler
      '0-1 inch', '1-2 inch', '2-3 inch', '3-4 inch', '4-5 inch', '5-6 inch',
      '6-7 inch', '7-8 inch', '8-9 inch', '9-10 inch', '10-12 inch', '12-15 inch', '15-18 inch'
    ],
    'Mikrometre - İç Çap': [
      '5-30 mm', '20-50 mm', '50-75 mm', '75-100 mm', '100-125 mm', '125-150 mm', 
      '150-175 mm', '175-200 mm', '200-250 mm', '250-300 mm', '300-400 mm', '400-500 mm',
      '25-50 mm', '40-65 mm', '60-85 mm', '80-105 mm',
      '0.2-1.2 inch', '0.8-2 inch', '2-3 inch', '3-4 inch', '4-6 inch', '6-8 inch'
    ],
    'Mikrometre - Derinlik': [
      '0-25 mm', '0-50 mm', '0-75 mm', '0-100 mm', '0-150 mm', '0-200 mm', '0-300 mm', '0-400 mm',
      '0-1 inch', '0-2 inch', '0-3 inch', '0-4 inch', '0-6 inch', '0-8 inch', '0-12 inch'
    ],
    'Mikrometre - Dişli': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '0-1 inch', '1-2 inch', '2-3 inch', '3-4 inch', '4-5 inch'
    ],
    'Mikrometre - V-Blok': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '0-1 inch', '1-2 inch', '2-3 inch', '3-4 inch'
    ],
    'Mikrometre - Boru Duvar Kalınlığı': [
      '0-25 mm', '0-50 mm', '0-75 mm', '5-30 mm', '10-35 mm',
      '0-1 inch', '0-2 inch', '0.2-1.2 inch', '0.4-1.4 inch'
    ],

    // Şerit Metre ve Cetveller
    'Şerit Metre': [
      '0-1000 mm', '0-2000 mm', '0-3000 mm', '0-5000 mm', '0-7500 mm', '0-10000 mm', 
      '0-15000 mm', '0-20000 mm', '0-25000 mm', '0-30000 mm', '0-50000 mm', '0-100000 mm',
      '0-1 m', '0-2 m', '0-3 m', '0-5 m', '0-7.5 m', '0-10 m', '0-15 m', '0-20 m', 
      '0-25 m', '0-30 m', '0-50 m', '0-100 m',
      '0-3 ft', '0-10 ft', '0-16 ft', '0-25 ft', '0-33 ft', '0-50 ft', '0-66 ft', 
      '0-100 ft', '0-164 ft', '0-328 ft'
    ],
    'Cetvel - Çelik': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-18 inch', '0-24 inch', '0-36 inch', '0-48 inch'
    ],
    'Cetvel - Alüminyum': [
      '0-300 mm', '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm', '0-3000 mm',
      '0-12 inch', '0-18 inch', '0-24 inch', '0-36 inch', '0-48 inch', '0-60 inch'
    ],

    // Yükseklik Ölçerler
    'Yükseklik Ölçer - Digital': [
      '0-200 mm', '0-300 mm', '0-500 mm', '0-600 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-8 inch', '0-12 inch', '0-20 inch', '0-24 inch', '0-40 inch', '0-60 inch', '0-80 inch'
    ],
    'Yükseklik Ölçer - Analog': [
      '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm',
      '0-8 inch', '0-12 inch', '0-20 inch', '0-40 inch'
    ],

    // Komparatörler
    'Komparatör - Digital': [
      '±0.5 mm', '±1 mm', '±2 mm', '±5 mm', '±10 mm', '±25 mm', '±50 mm',
      '±0.02 inch', '±0.04 inch', '±0.08 inch', '±0.2 inch', '±0.4 inch', '±1 inch', '±2 inch'
    ],
    'Komparatör - Analog': [
      '±0.1 mm', '±0.5 mm', '±1 mm', '±2 mm', '±5 mm', '±10 mm',
      '±0.004 inch', '±0.02 inch', '±0.04 inch', '±0.08 inch', '±0.2 inch', '±0.4 inch'
    ],

    // Açı Ölçüm Cihazları - Detaylı
    'Açı Ölçer - Digital': [
      '0-360°', '±180°', '0-90°', '0-45°', '±90°', '±45°', '0-180°',
      '0-90° x 4 yön', '±30°', '±60°', '0-270°'
    ],
    'Açı Ölçer - Analog': ['0-180°', '0-90°', '±90°', '±45°', '0-360°'],
    'Gonyometre - Universal': [
      '0-180°', '0-90°', '±180°', '0-360°', '±90°',
      '0° - 320°', '0° - 270°'
    ],
    'İnklinometre - Digital': [
      '±90°', '±45°', '0-90°', '±180°', '±30°', '±60°',
      '0-360°', '±5°', '±10°', '±15°'
    ],

    // Sıcaklık Ölçüm Cihazları - Kapsamlı
    'Termometre - Digital': [
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +800°C', '0°C - +100°C', '0°C - +200°C',
      '-40°C - +250°C', '-80°C - +400°C', '-150°C - +600°C', '-30°C - +150°C',
      '-58°F - +572°F', '-148°F - +932°F', '-328°F - +1472°F', '32°F - +212°F', '32°F - +392°F'
    ],
    'PT100 - Sınıf A': [
      '-200°C - +650°C', '-50°C - +300°C', '0°C - +100°C', '-100°C - +400°C', '-150°C - +500°C',
      '-328°F - +1202°F', '-58°F - +572°F', '32°F - +212°F', '-148°F - +752°F'
    ],
    'PT100 - Sınıf B': [
      '-200°C - +650°C', '-50°C - +300°C', '0°C - +100°C', '-100°C - +450°C',
      '-328°F - +1202°F', '-58°F - +572°F', '32°F - +212°F'
    ],
    'Termoçift - K Tipi': [
      '-200°C - +1250°C', '0°C - +1000°C', '200°C - +800°C', '-100°C - +900°C', '100°C - +1200°C',
      '-328°F - +2282°F', '32°F - +1832°F', '392°F - +1472°F', '-148°F - +1652°F'
    ],
    'Termoçift - J Tipi': [
      '-40°C - +750°C', '0°C - +600°C', '100°C - +700°C', '-20°C - +500°C',
      '-40°F - +1382°F', '32°F - +1112°F', '212°F - +1292°F'
    ],
    'Termoçift - T Tipi': [
      '-200°C - +350°C', '-100°C - +200°C', '0°C - +300°C', '-50°C - +250°C',
      '-328°F - +662°F', '-148°F - +392°F', '32°F - +572°F'
    ],

    // Test Ekipmanları - Çok Detaylı
    'Multimetre - Digital': [
      // DC Voltaj
      '0-200 mV DC', '0-2 V DC', '0-20 V DC', '0-200 V DC', '0-1000 V DC',
      // AC Voltaj
      '0-200 mV AC', '0-2 V AC', '0-20 V AC', '0-200 V AC', '0-750 V AC',
      // DC Akım
      '0-200 µA DC', '0-2 mA DC', '0-20 mA DC', '0-200 mA DC', '0-2 A DC', '0-10 A DC', '0-20 A DC',
      // AC Akım
      '0-200 µA AC', '0-2 mA AC', '0-20 mA AC', '0-200 mA AC', '0-2 A AC', '0-10 A AC',
      // Direnç
      '0-200 Ω', '0-2 kΩ', '0-20 kΩ', '0-200 kΩ', '0-2 MΩ', '0-20 MΩ', '0-200 MΩ',
      // Kapasitans
      '0-2 nF', '0-20 nF', '0-200 nF', '0-2 µF', '0-20 µF', '0-200 µF', '0-2000 µF',
      // Frekans
      '0-200 Hz', '0-2 kHz', '0-20 kHz', '0-200 kHz', '0-2 MHz', '0-20 MHz'
    ],
    'Osiloskop - Digital': [
      // Voltaj/Div
      '1 mV/div', '2 mV/div', '5 mV/div', '10 mV/div', '20 mV/div', '50 mV/div',
      '100 mV/div', '200 mV/div', '500 mV/div', '1 V/div', '2 V/div', '5 V/div', '10 V/div',
      // Zaman/Div
      '1 ns/div', '2 ns/div', '5 ns/div', '10 ns/div', '20 ns/div', '50 ns/div',
      '100 ns/div', '200 ns/div', '500 ns/div', '1 µs/div', '2 µs/div', '5 µs/div',
      '10 µs/div', '20 µs/div', '50 µs/div', '100 µs/div', '200 µs/div', '500 µs/div',
      '1 ms/div', '2 ms/div', '5 ms/div', '10 ms/div', '20 ms/div', '50 ms/div',
      '100 ms/div', '200 ms/div', '500 ms/div', '1 s/div', '2 s/div', '5 s/div', '10 s/div',
      // Bant Genişliği
      '20 MHz BW', '50 MHz BW', '100 MHz BW', '200 MHz BW', '500 MHz BW', '1 GHz BW', '2 GHz BW'
    ],

    // Basınç Cihazları - Detaylı
    'Manometre': [
      // Bar Ölçümler
      '0-1 bar', '0-1.6 bar', '0-2.5 bar', '0-4 bar', '0-6 bar', '0-10 bar', '0-16 bar', 
      '0-25 bar', '0-40 bar', '0-60 bar', '0-100 bar', '0-160 bar', '0-250 bar', '0-400 bar', '0-600 bar',
      // PSI Ölçümler
      '0-15 psi', '0-30 psi', '0-60 psi', '0-100 psi', '0-160 psi', '0-300 psi', '0-500 psi',
      '0-1000 psi', '0-1500 psi', '0-3000 psi', '0-5000 psi', '0-10000 psi',
      // kPa Ölçümler
      '0-100 kPa', '0-160 kPa', '0-250 kPa', '0-400 kPa', '0-600 kPa', '0-1000 kPa',
      '0-1600 kPa', '0-2500 kPa', '0-4000 kPa', '0-6000 kPa', '0-10000 kPa'
    ],

    // Hassas Teraziler - Detaylı
    'Hassas Terazi - 0.1mg': [
      '0-82 g', '0-120 g', '0-220 g', '0-320 g', '0-520 g',
      '0-3 oz', '0-4 oz', '0-8 oz', '0-11 oz', '0-18 oz'
    ],
    'Hassas Terazi - 0.01mg': [
      '0-52 g', '0-82 g', '0-120 g', '0-220 g',
      '0-2 oz', '0-3 oz', '0-4 oz', '0-8 oz'
    ],
    'Hassas Terazi - 1mg': [
      '0-220 g', '0-320 g', '0-520 g', '0-820 g', '0-1200 g', '0-2200 g', '0-3200 g', '0-5200 g',
      '0-8 oz', '0-11 oz', '0-18 oz', '0-29 oz', '0-42 oz', '0-78 oz', '0-113 oz', '0-184 oz'
    ],

    // Yeni Ölçüm Cihazları - Genişletilmiş Kategori
    'Takometre - Digital': [
      '0-1000 RPM', '0-2000 RPM', '0-5000 RPM', '0-10000 RPM', '0-15000 RPM', 
      '0-20000 RPM', '0-30000 RPM', '0-50000 RPM', '0-100000 RPM',
      '50-1000 RPM', '100-5000 RPM', '500-10000 RPM', '1000-20000 RPM',
      '5-1000 RPM', '10-5000 RPM', '20-10000 RPM', '100-50000 RPM'
    ],
    'Takometre - Laser': [
      '0-999999 RPM', '1-999999 RPM', '5-999999 RPM', '10-999999 RPM',
      '0-100000 RPM', '0-200000 RPM', '0-500000 RPM',
      '10-100000 RPM', '50-500000 RPM', '100-999999 RPM'
    ],
    'Takometre - Optik': [
      '0-50000 RPM', '0-100000 RPM', '0-200000 RPM', '0-500000 RPM',
      '5-50000 RPM', '10-100000 RPM', '50-200000 RPM', '100-500000 RPM'
    ],

    'Sentil Çakısı - 0.001mm': [
      '0-13 mm', '0-25 mm', '0-30 mm', '0-50 mm', '0-75 mm', '0-100 mm',
      '0-0.5 inch', '0-1 inch', '0-1.2 inch', '0-2 inch', '0-3 inch', '0-4 inch',
      '3-13 mm', '5-25 mm', '10-50 mm', '20-75 mm', '25-100 mm'
    ],
    'Sentil Çakısı - 0.002mm': [
      '0-13 mm', '0-25 mm', '0-50 mm', '0-100 mm', '0-150 mm',
      '0-0.5 inch', '0-1 inch', '0-2 inch', '0-4 inch', '0-6 inch',
      '5-25 mm', '10-50 mm', '25-100 mm', '50-150 mm'
    ],
    'Sentil Çakısı - 0.005mm': [
      '0-25 mm', '0-50 mm', '0-100 mm', '0-150 mm', '0-200 mm',
      '0-1 inch', '0-2 inch', '0-4 inch', '0-6 inch', '0-8 inch',
      '10-50 mm', '25-100 mm', '50-150 mm', '75-200 mm'
    ],

    'Radius Mastar - İç R': [
      'R 1-7 mm', 'R 2-12 mm', 'R 3-17 mm', 'R 7-14 mm', 'R 8-15 mm',
      'R 1-25 mm', 'R 3.5-17 mm', 'R 7-14.5 mm', 'R 15-25 mm',
      'R 0.5-2.5 mm', 'R 1-6 mm', 'R 2.5-12.5 mm', 'R 6-25 mm',
      'R 0.04-0.28 inch', 'R 0.08-0.47 inch', 'R 0.12-0.67 inch',
      'R 0.28-0.55 inch', 'R 0.31-0.59 inch', 'R 0.04-0.98 inch'
    ],
    'Radius Mastar - Dış R': [
      'R 1-7 mm', 'R 2-12 mm', 'R 3-17 mm', 'R 7-14 mm', 'R 8-15 mm',
      'R 1-25 mm', 'R 3.5-17 mm', 'R 7-14.5 mm', 'R 15-25 mm',
      'R 0.5-2.5 mm', 'R 1-6 mm', 'R 2.5-12.5 mm', 'R 6-25 mm',
      'R 0.04-0.28 inch', 'R 0.08-0.47 inch', 'R 0.12-0.67 inch',
      'R 0.28-0.55 inch', 'R 0.31-0.59 inch', 'R 0.04-0.98 inch'
    ],
    'Radius Mastar - Universal': [
      'R 0.5-25 mm', 'R 1-15 mm', 'R 2-20 mm', 'R 3-25 mm', 'R 5-30 mm',
      'R 0.02-0.98 inch', 'R 0.04-0.59 inch', 'R 0.08-0.79 inch',
      'R 0.12-0.98 inch', 'R 0.2-1.18 inch'
    ],

    'Dijital Isı Ölçer - İnfrared': [
      '-50°C - +380°C', '-50°C - +500°C', '-50°C - +800°C', '-50°C - +1000°C',
      '-32°C - +760°C', '-32°C - +1350°C', '-18°C - +1650°C',
      '-60°C - +500°C', '-80°C - +1000°C', '-100°C - +1500°C',
      '-58°F - +716°F', '-58°F - +932°F', '-58°F - +1472°F', '-58°F - +1832°F',
      '-25°F - +1382°F', '-25°F - +2462°F', '0°F - +3002°F'
    ],
    'Dijital Isı Ölçer - Temaslı': [
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +1000°C', '-250°C - +1200°C',
      '-40°C - +200°C', '-80°C - +400°C', '-150°C - +800°C', '-200°C - +1100°C',
      '-58°F - +572°F', '-148°F - +932°F', '-328°F - +1832°F', '-418°F - +2192°F',
      '-40°F - +392°F', '-112°F - +752°F', '-238°F - +1472°F'
    ],
    'Dijital Isı Ölçer - Problu': [
      '-50°C - +300°C', '-100°C - +400°C', '-200°C - +800°C', '-250°C - +1000°C',
      '-40°C - +150°C', '-60°C - +250°C', '-150°C - +600°C', '-200°C - +900°C',
      '-58°F - +572°F', '-148°F - +752°F', '-328°F - +1472°F', '-418°F - +1832°F',
      '-40°F - +302°F', '-76°F - +482°F', '-238°F - +1112°F'
    ],

    // Su Terazisi Çeşitleri
    'Su Terazisi - Standart': [
      '0-90°', '±45°', '±30°', '±15°', '±10°', '±5°', 
      '0-180°', '±90°', '±60°', '±20°', '±1°', '±0.5°',
      '200mm uzunluk', '300mm uzunluk', '400mm uzunluk', '500mm uzunluk',
      '600mm uzunluk', '800mm uzunluk', '1000mm uzunluk', '1200mm uzunluk'
    ],
    'Su Terazisi - Hassas': [
      '±1°', '±0.5°', '±0.2°', '±0.1°', '±0.05°', '±0.02°', '±0.01°',
      '±0.5 mm/m', '±0.2 mm/m', '±0.1 mm/m', '±0.05 mm/m', '±0.02 mm/m',
      '150mm uzunluk', '200mm uzunluk', '250mm uzunluk', '300mm uzunluk',
      '400mm uzunluk', '500mm uzunluk', '600mm uzunluk'
    ],
    'Su Terazisi - Digital': [
      '±90°', '±45°', '±30°', '±15°', '±10°', '±5°', '±1°', '±0.5°',
      '±0.1°', '±0.05°', '±0.02°', '±0.01°', '±0.005°', '±0.002°', '±0.001°',
      '0-360°', '±180°', '±120°', '±60°', '±20°',
      '200mm uzunluk', '300mm uzunluk', '400mm uzunluk', '600mm uzunluk', '800mm uzunluk'
    ],

    // Varsayılan değerler
    'Diğer': ['0-100', '0-1000', 'Özel Aralık']
  };
  
  localStorage.setItem('measurement_ranges_by_sub_category', JSON.stringify(defaultRanges));
  localStorage.setItem('measurement_ranges_version', '2.0');
  return defaultRanges;
};

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
      '125-150 mm', '150-175 mm', '175-200 mm', '200-250 mm', '250-300 mm',
      '300-400 mm', '400-500 mm', '500-600 mm', '600-800 mm', '800-1000 mm',
      '0-50 mm', '0-100 mm', '0-150 mm', '0-200 mm', '0-300 mm', 
      '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm', '0-3000 mm', 
      '0-5000 mm', '0-10000 mm', 'Diğer'
    ],

    'Açı Ölçüm Cihazları': [
      '0-90°', '0-180°', '0-360°', '0-90° ±90°', '±180°', '±360°',
      '0-30°', '0-45°', '0-60°', '30-90°', '90-180°', '180-270°',
      '270-360°', '0-1° (Hassas)', '0-5° (Hassas)', '0-10° (Hassas)',
      '0-0.1° (Ultra Hassas)', '0-0.01° (Ultra Hassas)', 'Diğer'
    ],

    'Sıcaklık Ölçüm Cihazları': [
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +800°C',
      '-50°C - +150°C', '-100°C - +300°C', '0°C - +100°C',
      '0°C - +200°C', '0°C - +300°C', '0°C - +500°C', '0°C - +1000°C',
      '-80°C - +200°C', '-40°C - +125°C', '-20°C - +80°C',
      '0°C - +50°C', '10°C - +40°C', 'Diğer'
    ],

  'Test Ekipmanları': [
    '0-10 V', '0-100 V', '0-1000 V', '0-10 A', '0-100 A', 
      '0-1000 A', '0-1 kHz', '0-100 kHz', '0-1 MHz', '0-10 MHz',
      '0-100 MHz', '0-1 GHz', '0-50 Ω', '0-1000 Ω', '0-10 kΩ',
      '0-1 MΩ', '0-100 MΩ', 'Diğer'
  ],
  'Üretim Makineleri': [
    '0-100 kN', '0-500 kN', '0-1000 kN', '0-5000 kN',
      '0-100 Nm', '0-500 Nm', '0-1000 Nm', '0-5000 Nm',
      '0-10000 Nm', '0-50000 Nm', 'Diğer'
  ],
  'Kalite Kontrol Cihazları': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '125-150 mm', '150-175 mm', '175-200 mm', '200-250 mm', '250-300 mm',
      '0-50 mm', '0-100 mm', '0-200 mm', '0-300 mm', '0-500 mm', 
      '0-1000 mm', '0-1500 mm', '0-2000 mm', 'Diğer'
  ],
  'Kaynak Ekipmanları': [
    '0-300 A', '0-500 A', '0-1000 A', '10-50 V',
    '20-80 V', '0-100%', 'Diğer'
  ],
  'Elektrikli Cihazlar': [
      '0-12 V', '0-24 V', '0-48 V', '0-110 V', '0-220 V', '0-380 V',
      '0-400 V', '0-500 V', '0-690 V', '0-1000 V', '0-1500 V',
      '0-10 A', '0-50 A', '0-100 A', '0-200 A', '0-500 A', '0-1000 A',
      '0-50 Hz', '0-60 Hz', '0-400 Hz', '0-1000 Hz', '0-10 kHz',
      '0-50 Ω', '0-1000 Ω', '0-10 kΩ', '0-1 MΩ', '0-100 MΩ',
      '0-1000 W', '0-10 kW', '0-100 kW', 'Diğer'
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
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +800°C',
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

// Alt kategoriye göre ölçüm belirsizlikleri
const getMeasurementUncertaintiesBySubCategory = () => {
  const stored = localStorage.getItem('measurement_uncertainties_by_sub_category');
  const version = localStorage.getItem('measurement_uncertainties_version');
  // Versiyon kontrolü - Yeni cihazlar eklendiğinde cache'i yenile
  if (stored && version === '2.0') {
    return JSON.parse(stored);
  }
  
  const defaultUncertainties = {
    // Kumpas Çeşitleri - Detaylı Belirsizlik Değerleri
    'Kumpas - Digital': [
      '±0.01 mm', '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', 
      '±0.06 mm', '±0.07 mm', '±0.08 mm', '±0.09 mm', '±0.1 mm', 
      '±0.12 mm', '±0.15 mm', '±0.18 mm', '±0.2 mm', '±0.25 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.001 inch', '±0.002 inch', 
      '±0.003 inch', '±0.004 inch', '±0.005 inch', '±0.006 inch', '±0.008 inch'
    ],
    'Kumpas - Analog': [
      '±0.02 mm', '±0.05 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm', '±0.3 mm',
      '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.006 inch', '±0.008 inch'
    ],
    'Kumpas - Abaküs': [
      '±0.02 mm', '±0.05 mm', '±0.1 mm', '±0.15 mm',
      '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - İç Çap': [
      '±0.01 mm', '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', 
      '±0.06 mm', '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.001 inch', '±0.002 inch', 
      '±0.003 inch', '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - Dış Çap': [
      '±0.01 mm', '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm',
      '±0.06 mm', '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.001 inch', '±0.002 inch', 
      '±0.003 inch', '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - Derinlik': [
      '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm', 
      '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm',
      '±0.0008 inch', '±0.001 inch', '±0.002 inch', '±0.003 inch', 
      '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - Yükseklik': [
      '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm', 
      '±0.08 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm', '±0.25 mm',
      '±0.0008 inch', '±0.001 inch', '±0.002 inch', '±0.003 inch', 
      '±0.004 inch', '±0.006 inch', '±0.008 inch', '±0.01 inch'
    ],

    // Mikrometre Çeşitleri - Son Derece Hassas Belirsizlik Değerleri
    'Mikrometre - Dış Çap': [
      '±0.0005 mm', '±0.001 mm', '±0.0015 mm', '±0.002 mm', '±0.0025 mm',
      '±0.003 mm', '±0.0035 mm', '±0.004 mm', '±0.0045 mm', '±0.005 mm',
      '±0.006 mm', '±0.007 mm', '±0.008 mm', '±0.009 mm', '±0.01 mm',
      '±0.012 mm', '±0.015 mm', '±0.018 mm', '±0.02 mm', '±0.025 mm',
      // İnç değerleri
      '±0.00002 inch', '±0.00004 inch', '±0.00006 inch', '±0.00008 inch',
      '±0.0001 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00025 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch', '±0.001 inch'
    ],
    'Mikrometre - İç Çap': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.007 mm', '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm',
      '±0.018 mm', '±0.02 mm', '±0.025 mm', '±0.03 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.00025 inch', '±0.0003 inch', '±0.0004 inch',
      '±0.0005 inch', '±0.0006 inch', '±0.0008 inch', '±0.001 inch'
    ],
    'Mikrometre - Derinlik': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.0003 inch', '±0.0004 inch', '±0.0006 inch', '±0.0008 inch'
    ],
    'Mikrometre - Dişli': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.0003 inch', '±0.0004 inch', '±0.0006 inch'
    ],
    'Mikrometre - V-Blok': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.0003 inch', '±0.0004 inch'
    ],
    'Mikrometre - Boru Duvar Kalınlığı': [
      '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm', '±0.008 mm',
      '±0.01 mm', '±0.012 mm', '±0.015 mm',
      // İnç değerleri
      '±0.0001 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.0003 inch', '±0.0004 inch', '±0.0006 inch'
    ],

    // Şerit Metre ve Cetveller
    'Şerit Metre': [
      // Standart belirsizlikler (Sınıf bazlı)
      '±0.3 mm/m', '±0.5 mm/m', '±1 mm/m', '±1.5 mm/m', '±2 mm/m',
      '±3 mm/m', '±5 mm/m', '±8 mm/m', '±10 mm/m', '±15 mm/m',
      // Mutlak değerler (kısa mesafeler için)
      '±1 mm', '±2 mm', '±3 mm', '±5 mm', '±10 mm', '±15 mm', '±20 mm', '±30 mm', '±50 mm',
      // Sınıf I (Hassas şerit metreler)
      '±(0.1 + 0.1L) mm', '±(0.2 + 0.1L) mm',
      // Sınıf II (Standart şerit metreler)
      '±(0.3 + 0.2L) mm', '±(0.6 + 0.4L) mm',
      // Sınıf III (Genel amaçlı)
      '±(1.5 + 0.3L) mm', '±(3 + 0.5L) mm',
      // İnç değerleri
      '±0.012 inch/ft', '±0.02 inch/ft', '±0.04 inch/ft', '±0.06 inch/ft',
      '±0.08 inch/ft', '±0.12 inch/ft', '±0.2 inch/ft', '±0.3 inch/ft', '±0.5 inch/ft',
      // Mutlak inç değerleri
      '±1/32 inch', '±1/16 inch', '±1/8 inch', '±1/4 inch', '±1/2 inch', '±1 inch'
    ],
    'Cetvel - Çelik': [
      '±0.1 mm', '±0.15 mm', '±0.2 mm', '±0.3 mm', '±0.4 mm', '±0.5 mm',
      '±1 mm', '±1.5 mm', '±2 mm', '±3 mm',
      '±0.004 inch', '±0.006 inch', '±0.008 inch', '±0.012 inch',
      '±0.016 inch', '±0.02 inch', '±0.04 inch', '±0.06 inch', '±0.08 inch'
    ],
    'Cetvel - Alüminyum': [
      '±0.2 mm', '±0.3 mm', '±0.4 mm', '±0.5 mm', '±0.8 mm', '±1 mm',
      '±1.5 mm', '±2 mm', '±3 mm', '±5 mm',
      '±0.008 inch', '±0.012 inch', '±0.016 inch', '±0.02 inch',
      '±0.03 inch', '±0.04 inch', '±0.06 inch', '±0.08 inch', '±0.12 inch', '±0.2 inch'
    ],

    // Yükseklik Ölçerler
    'Yükseklik Ölçer - Digital': [
      '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm',
      '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm', '±0.2 mm',
      '±0.25 mm', '±0.3 mm', '±0.4 mm', '±0.5 mm',
      // İnç değerleri
      '±0.0008 inch', '±0.001 inch', '±0.0012 inch', '±0.0015 inch',
      '±0.002 inch', '±0.003 inch', '±0.004 inch', '±0.006 inch',
      '±0.008 inch', '±0.01 inch', '±0.012 inch', '±0.015 inch', '±0.02 inch'
    ],
    'Yükseklik Ölçer - Analog': [
      '±0.05 mm', '±0.08 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm',
      '±0.3 mm', '±0.4 mm', '±0.5 mm',
      // İnç değerleri
      '±0.002 inch', '±0.003 inch', '±0.004 inch', '±0.006 inch',
      '±0.008 inch', '±0.012 inch', '±0.016 inch', '±0.02 inch'
    ],

    // Komparatörler
    'Komparatör - Digital': [
      '±0.0002 mm', '±0.0005 mm', '±0.001 mm', '±0.002 mm', '±0.003 mm',
      '±0.005 mm', '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm',
      '±0.2 mm', '±0.5 mm', '±1 mm', '±2 mm', '±5 mm',
      // İnç değerleri
      '±0.000008 inch', '±0.00002 inch', '±0.00004 inch', '±0.00008 inch',
      '±0.0001 inch', '±0.0002 inch', '±0.0004 inch', '±0.0008 inch',
      '±0.002 inch', '±0.004 inch', '±0.008 inch', '±0.02 inch', '±0.04 inch',
      '±0.08 inch', '±0.2 inch'
    ],
    'Komparatör - Analog': [
      '±0.001 mm', '±0.002 mm', '±0.005 mm', '±0.01 mm', '±0.02 mm',
      '±0.05 mm', '±0.1 mm', '±0.2 mm', '±0.5 mm', '±1 mm',
      // İnç değerleri
      '±0.00004 inch', '±0.00008 inch', '±0.0002 inch', '±0.0004 inch',
      '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.008 inch',
      '±0.02 inch', '±0.04 inch'
    ],

    // Açı Ölçüm Cihazları - Son Derece Detaylı
    'Açı Ölçer - Digital': [
      '±0.001°', '±0.002°', '±0.003°', '±0.005°', '±0.008°', '±0.01°',
      '±0.015°', '±0.02°', '±0.03°', '±0.05°', '±0.08°', '±0.1°',
      '±0.15°', '±0.2°', '±0.3°', '±0.5°', '±1°',
      // Arcmin cinsinden
      '±0.1 arcmin', '±0.2 arcmin', '±0.5 arcmin', '±1 arcmin',
      '±2 arcmin', '±5 arcmin', '±10 arcmin',
      // Arcsec cinsinden
      '±1 arcsec', '±2 arcsec', '±5 arcsec', '±10 arcsec', '±30 arcsec'
    ],
    'Açı Ölçer - Analog': [
      '±0.1°', '±0.2°', '±0.3°', '±0.5°', '±1°', '±2°', '±5°', '±10°',
      // Arcmin cinsinden
      '±5 arcmin', '±10 arcmin', '±15 arcmin', '±30 arcmin'
    ],
    'Gonyometre - Universal': [
      '±1 arcmin', '±2 arcmin', '±5 arcmin', '±10 arcmin', '±15 arcmin',
      '±30 arcmin', '±60 arcmin',
      // Derece cinsinden
      '±0.02°', '±0.05°', '±0.1°', '±0.2°', '±0.5°', '±1°'
    ],
    'İnklinometre - Digital': [
      '±0.01°', '±0.02°', '±0.03°', '±0.05°', '±0.08°', '±0.1°',
      '±0.15°', '±0.2°', '±0.3°', '±0.5°', '±1°',
      // Özel açılar için
      '±0.005° (0-15°)', '±0.01° (15-90°)', '±0.02° (90-180°)'
    ],

    // Sıcaklık Ölçüm Cihazları - Kapsamlı ve Detaylı
    'Termometre - Digital': [
      '±0.01°C', '±0.02°C', '±0.03°C', '±0.05°C', '±0.08°C', '±0.1°C',
      '±0.15°C', '±0.2°C', '±0.3°C', '±0.5°C', '±0.8°C', '±1°C',
      '±1.5°C', '±2°C', '±3°C', '±5°C',
      // Fahrenheit değerleri
      '±0.02°F', '±0.04°F', '±0.06°F', '±0.1°F', '±0.15°F', '±0.2°F',
      '±0.3°F', '±0.4°F', '±0.5°F', '±1°F', '±1.5°F', '±2°F', '±3°F', '±5°F'
    ],
    'PT100 - Sınıf A': [
      '±(0.15 + 0.002|t|)°C', '±(0.27 + 0.004|t|)°F',
      '±0.1°C @ 0°C', '±0.15°C @ 100°C', '±0.35°C @ 200°C',
      '±0.55°C @ 300°C', '±0.75°C @ 400°C', '±0.95°C @ 500°C',
      '±1.15°C @ 600°C', '±1.45°C @ 650°C'
    ],
    'PT100 - Sınıf B': [
      '±(0.3 + 0.005|t|)°C', '±(0.54 + 0.009|t|)°F',
      '±0.3°C @ 0°C', '±0.8°C @ 100°C', '±1.3°C @ 200°C',
      '±1.8°C @ 300°C', '±2.3°C @ 400°C', '±2.8°C @ 500°C',
      '±3.3°C @ 600°C', '±3.6°C @ 650°C'
    ],
    'Termoçift - K Tipi': [
      '±1.5°C (-40°C~375°C)', '±0.4% FS (375°C~1000°C)', 
      '±0.75% FS (1000°C~1200°C)',
      '±2.5°C (-40°C~333°C)', '±0.75% FS (333°C~1200°C)',
      // Fahrenheit
      '±2.7°F (-40°F~705°F)', '±0.4% FS (705°F~1832°F)',
      '±0.75% FS (1832°F~2192°F)'
    ],
    'Termoçift - J Tipi': [
      '±1.5°C (-40°C~375°C)', '±0.4% FS (375°C~750°C)',
      '±2.5°C (-40°C~333°C)', '±0.75% FS (333°C~750°C)',
      // Fahrenheit
      '±2.7°F (-40°F~705°F)', '±0.4% FS (705°F~1382°F)'
    ],
    'Termoçift - T Tipi': [
      '±0.5°C (-40°C~125°C)', '±0.4% FS (125°C~350°C)',
      '±1°C (-40°C~133°C)', '±0.75% FS (133°C~350°C)',
      // Fahrenheit
      '±1°F (-40°F~257°F)', '±0.4% FS (257°F~662°F)'
    ],

    // Test Ekipmanları - Son Derece Detaylı
    'Multimetre - Digital': [
      // DC Voltaj Belirsizlikleri
      '±(0.01% + 2d) DC V', '±(0.02% + 3d) DC V', '±(0.05% + 5d) DC V',
      '±(0.08% + 8d) DC V', '±(0.1% + 10d) DC V', '±(0.15% + 15d) DC V',
      '±(0.2% + 20d) DC V', '±(0.3% + 30d) DC V', '±(0.5% + 50d) DC V',
      // AC Voltaj Belirsizlikleri
      '±(0.05% + 5d) AC V', '±(0.1% + 10d) AC V', '±(0.2% + 20d) AC V',
      '±(0.3% + 30d) AC V', '±(0.5% + 50d) AC V', '±(1% + 100d) AC V',
      // DC Akım Belirsizlikleri
      '±(0.02% + 5d) DC A', '±(0.05% + 8d) DC A', '±(0.1% + 15d) DC A',
      '±(0.2% + 25d) DC A', '±(0.3% + 40d) DC A', '±(0.5% + 60d) DC A',
      // AC Akım Belirsizlikleri
      '±(0.1% + 15d) AC A', '±(0.2% + 25d) AC A', '±(0.3% + 40d) AC A',
      '±(0.5% + 60d) AC A', '±(1% + 100d) AC A',
      // Direnç Belirsizlikleri
      '±(0.01% + 5d) Ω', '±(0.02% + 8d) Ω', '±(0.05% + 15d) Ω',
      '±(0.1% + 25d) Ω', '±(0.2% + 50d) Ω', '±(0.5% + 100d) Ω',
      // Frekans Belirsizlikleri
      '±(0.001% + 2d) Hz', '±(0.002% + 3d) Hz', '±(0.005% + 5d) Hz',
      '±(0.01% + 8d) Hz', '±(0.02% + 15d) Hz'
    ],
    'Osiloskop - Digital': [
      // Voltaj Doğruluğu
      '±1% FS', '±2% FS', '±3% FS', '±5% FS',
      // Zaman Doğruluğu
      '±10 ppm', '±25 ppm', '±50 ppm', '±100 ppm',
      // Bant Genişliği Belirsizlikleri
      '±3 dB @ BW', '±1 dB @ BW/2', '±0.5 dB @ BW/4',
      // Sample Rate Belirsizlikleri
      '±0.01% SR', '±0.02% SR', '±0.05% SR', '±0.1% SR'
    ],

    // Basınç Cihazları - Son Derece Detaylı
    'Manometre': [
      // Sınıf 0.1
      '±0.1% FS (Sınıf 0.1)', '±0.16% FS (Sınıf 0.16)',
      // Sınıf 0.25
      '±0.25% FS (Sınıf 0.25)', '±0.4% FS (Sınıf 0.4)',
      // Sınıf 0.6
      '±0.6% FS (Sınıf 0.6)', '±1% FS (Sınıf 1)',
      // Sınıf 1.6
      '±1.6% FS (Sınıf 1.6)', '±2.5% FS (Sınıf 2.5)',
      // Sınıf 4
      '±4% FS (Sınıf 4)', '±6% FS (Sınıf 6)',
      // Mutlak değerler
      '±0.01 bar', '±0.02 bar', '±0.05 bar', '±0.1 bar',
      '±0.2 bar', '±0.5 bar', '±1 bar', '±2 bar', '±5 bar', '±10 bar',
      // PSI değerleri
      '±0.15 psi', '±0.3 psi', '±0.7 psi', '±1.5 psi',
      '±3 psi', '±7 psi', '±15 psi', '±30 psi', '±70 psi', '±150 psi'
    ],

    // Hassas Teraziler - Çok Detaylı Belirsizlik Analizi
    'Hassas Terazi - 0.1mg': [
      '±0.1 mg (Okunabilirlik)', '±0.2 mg (Tekrarlanabilirlik)',
      '±0.3 mg (Doğrusallık)', '±0.5 mg (Toplam Belirsizlik)',
      '±1 mg (Geniş Aralık)', '±2 mg (Maksimum Yük)',
      // Ounce değerleri
      '±0.000004 oz', '±0.000007 oz', '±0.00001 oz', '±0.000018 oz'
    ],
    'Hassas Terazi - 0.01mg': [
      '±0.01 mg (Okunabilirlik)', '±0.02 mg (Tekrarlanabilirlik)',
      '±0.03 mg (Doğrusallık)', '±0.05 mg (Toplam Belirsizlik)',
      '±0.1 mg (Geniş Aralık)', '±0.2 mg (Maksimum Yük)',
      // Ounce değerleri
      '±0.0000004 oz', '±0.0000007 oz', '±0.000001 oz', '±0.0000018 oz'
    ],
    'Hassas Terazi - 1mg': [
      '±1 mg (Okunabilirlik)', '±2 mg (Tekrarlanabilirlik)',
      '±3 mg (Doğrusallık)', '±5 mg (Toplam Belirsizlik)',
      '±8 mg (Geniş Aralık)', '±10 mg (Maksimum Yük)',
      '±15 mg (Çok Yüksek Yük)', '±20 mg (Maksimum Kapasite)',
      // Ounce değerleri
      '±0.00004 oz', '±0.00007 oz', '±0.0001 oz', '±0.00018 oz',
      '±0.0003 oz', '±0.0004 oz', '±0.0005 oz', '±0.0007 oz'
    ],

    // Yeni Ölçüm Cihazları Belirsizlikleri - Genişletilmiş
    'Takometre - Digital': [
      '±0.01 RPM', '±0.02 RPM', '±0.05 RPM', '±0.1 RPM', '±0.2 RPM', '±0.5 RPM',
      '±1 RPM', '±2 RPM', '±5 RPM', '±10 RPM', '±20 RPM', '±50 RPM',
      '±0.01%', '±0.02%', '±0.05%', '±0.1%', '±0.2%', '±0.5%',
      '±0.01% + 1d', '±0.02% + 1d', '±0.05% + 1d', '±0.1% + 1d',
      '±(0.01% FS + 1 RPM)', '±(0.02% FS + 2 RPM)', '±(0.05% FS + 5 RPM)',
      '±1 sayım', '±2 sayım', '±5 sayım', '±10 sayım'
    ],
    'Takometre - Laser': [
      '±0.01 RPM', '±0.02 RPM', '±0.05 RPM', '±0.1 RPM', '±0.2 RPM',
      '±0.5 RPM', '±1 RPM', '±2 RPM', '±5 RPM', '±10 RPM',
      '±0.01%', '±0.02%', '±0.05%', '±0.1%', '±0.2%',
      '±(0.01% FS + 0.1 RPM)', '±(0.02% FS + 0.2 RPM)', '±(0.05% FS + 0.5 RPM)',
      '±1 sayım', '±2 sayım', '±5 sayım'
    ],
    'Takometre - Optik': [
      '±0.02 RPM', '±0.05 RPM', '±0.1 RPM', '±0.2 RPM', '±0.5 RPM',
      '±1 RPM', '±2 RPM', '±5 RPM', '±10 RPM', '±20 RPM',
      '±0.02%', '±0.05%', '±0.1%', '±0.2%', '±0.5%',
      '±(0.02% FS + 1 RPM)', '±(0.05% FS + 2 RPM)', '±(0.1% FS + 5 RPM)',
      '±1 sayım', '±2 sayım', '±5 sayım', '±10 sayım'
    ],

    'Sentil Çakısı - 0.001mm': [
      '±0.001 mm', '±0.0015 mm', '±0.002 mm', '±0.0025 mm', '±0.003 mm',
      '±0.004 mm', '±0.005 mm', '±0.006 mm', '±0.008 mm', '±0.01 mm',
      '±0.00004 inch', '±0.00006 inch', '±0.00008 inch', '±0.0001 inch',
      '±0.00012 inch', '±0.00015 inch', '±0.0002 inch', '±0.00024 inch',
      '±0.0003 inch', '±0.0004 inch'
    ],
    'Sentil Çakısı - 0.002mm': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      '±0.00008 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00024 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch'
    ],
    'Sentil Çakısı - 0.005mm': [
      '±0.005 mm', '±0.006 mm', '±0.008 mm', '±0.01 mm', '±0.012 mm',
      '±0.015 mm', '±0.02 mm', '±0.025 mm', '±0.03 mm', '±0.04 mm',
      '±0.0002 inch', '±0.00024 inch', '±0.0003 inch', '±0.0004 inch',
      '±0.0005 inch', '±0.0006 inch', '±0.0008 inch', '±0.001 inch',
      '±0.0012 inch', '±0.0015 inch'
    ],

    'Radius Mastar - İç R': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      '±0.025 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm',
      '±0.00008 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00024 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch', '±0.001 inch', '±0.0012 inch',
      '±0.0015 inch', '±0.002 inch'
    ],
    'Radius Mastar - Dış R': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      '±0.025 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm',
      '±0.00008 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00024 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch', '±0.001 inch', '±0.0012 inch',
      '±0.0015 inch', '±0.002 inch'
    ],
    'Radius Mastar - Universal': [
      '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm', '±0.008 mm',
      '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm', '±0.025 mm',
      '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm', '±0.08 mm',
      '±0.00012 inch', '±0.00015 inch', '±0.0002 inch', '±0.00024 inch',
      '±0.0003 inch', '±0.0004 inch', '±0.0005 inch', '±0.0006 inch',
      '±0.0008 inch', '±0.001 inch', '±0.0012 inch', '±0.0015 inch',
      '±0.002 inch', '±0.0024 inch', '±0.003 inch'
    ],

    'Dijital Isı Ölçer - İnfrared': [
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.5°C', '±0.8°C', '±1°C',
      '±1.5°C', '±2°C', '±3°C', '±5°C', '±8°C', '±10°C', '±15°C',
      '±0.2°F', '±0.4°F', '±0.5°F', '±1°F', '±1.5°F', '±2°F',
      '±3°F', '±4°F', '±5°F', '±9°F', '±15°F', '±18°F', '±27°F',
      // Yüzde tabanlı belirsizlikler
      '±0.5% FS', '±1% FS', '±1.5% FS', '±2% FS', '±3% FS', '±5% FS',
      // Kombinasyon belirsizlikler
      '±(0.5% FS + 1°C)', '±(1% FS + 1°C)', '±(1% FS + 2°C)',
      '±(1.5% FS + 3°C)', '±(2% FS + 5°C)'
    ],
    'Dijital Isı Ölçer - Temaslı': [
      '±0.05°C', '±0.1°C', '±0.15°C', '±0.2°C', '±0.3°C', '±0.5°C',
      '±0.8°C', '±1°C', '±1.5°C', '±2°C', '±3°C', '±5°C',
      '±0.1°F', '±0.2°F', '±0.3°F', '±0.4°F', '±0.5°F', '±1°F',
      '±1.5°F', '±2°F', '±3°F', '±4°F', '±5°F', '±9°F',
      // Standart tip sensörler için
      '±(0.1% FS + 0.1°C)', '±(0.2% FS + 0.2°C)', '±(0.3% FS + 0.3°C)',
      '±(0.5% FS + 0.5°C)', '±(1% FS + 1°C)'
    ],
    'Dijital Isı Ölçer - Problu': [
      '±0.1°C', '±0.15°C', '±0.2°C', '±0.3°C', '±0.5°C', '±0.8°C',
      '±1°C', '±1.5°C', '±2°C', '±3°C', '±5°C', '±8°C',
      '±0.2°F', '±0.3°F', '±0.4°F', '±0.5°F', '±1°F', '±1.5°F',
      '±2°F', '±3°F', '±4°F', '±5°F', '±9°F', '±15°F',
      // Prob tipine göre belirsizlikler
      '±(0.2% FS + 0.2°C)', '±(0.3% FS + 0.3°C)', '±(0.5% FS + 0.5°C)',
      '±(0.8% FS + 0.8°C)', '±(1% FS + 1°C)', '±(1.5% FS + 1.5°C)'
    ],

    // Su Terazisi Belirsizlikleri
    'Su Terazisi - Standart': [
      '±1°', '±0.5°', '±0.2°', '±0.1°', '±0.05°', '±0.02°', '±0.01°',
      '±2°', '±1.5°', '±0.8°', '±0.3°', '±0.15°', '±0.08°', '±0.03°',
      // mm/m cinsinden
      '±1 mm/m', '±0.5 mm/m', '±0.2 mm/m', '±0.1 mm/m', '±0.05 mm/m',
      '±0.02 mm/m', '±0.01 mm/m', '±0.005 mm/m', '±0.002 mm/m',
      // Kabarcık hassasiyeti
      '±1 bölme', '±0.5 bölme', '±0.2 bölme', '±0.1 bölme',
      // İnç birimler
      '±0.04 inch/ft', '±0.02 inch/ft', '±0.008 inch/ft', '±0.004 inch/ft'
    ],
    'Su Terazisi - Hassas': [
      '±0.1°', '±0.05°', '±0.02°', '±0.01°', '±0.005°', '±0.002°', '±0.001°',
      '±0.08°', '±0.03°', '±0.015°', '±0.008°', '±0.003°', '±0.0015°', '±0.0008°',
      // mm/m cinsinden - Hassas Teraziler
      '±0.1 mm/m', '±0.05 mm/m', '±0.02 mm/m', '±0.01 mm/m', '±0.005 mm/m',
      '±0.002 mm/m', '±0.001 mm/m', '±0.0005 mm/m', '±0.0002 mm/m',
      // Arcmin/arcsec cinsinden
      '±6 arcmin', '±3 arcmin', '±1 arcmin', '±30 arcsec', '±15 arcsec',
      '±10 arcsec', '±5 arcsec', '±2 arcsec', '±1 arcsec'
    ],
    'Su Terazisi - Digital': [
      '±0.01°', '±0.005°', '±0.002°', '±0.001°', '±0.0005°', '±0.0002°', '±0.0001°',
      '±0.008°', '±0.003°', '±0.0015°', '±0.0008°', '±0.0003°', '±0.00015°', '±0.00008°',
      // Digital hassasiyet - çok hassas
      '±0.01% FS', '±0.005% FS', '±0.002% FS', '±0.001% FS', '±0.0005% FS',
      // Arcsec cinsinden - Digital
      '±36 arcsec', '±18 arcsec', '±7 arcsec', '±4 arcsec', '±2 arcsec',
      '±1 arcsec', '±0.5 arcsec', '±0.2 arcsec', '±0.1 arcsec',
      // mm/m cinsinden - Digital
      '±0.01 mm/m', '±0.005 mm/m', '±0.002 mm/m', '±0.001 mm/m', '±0.0005 mm/m'
    ],

    // Varsayılan değerler
    'Diğer': ['±0.1%', '±0.2%', '±0.5%', '±1%', '±2%', '±5%', 'Özel Belirsizlik']
  };
  
  localStorage.setItem('measurement_uncertainties_by_sub_category', JSON.stringify(defaultUncertainties));
  localStorage.setItem('measurement_uncertainties_version', '2.0');
  return defaultUncertainties;
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

    'Açı Ölçüm Cihazları': [
      '0°', '±0.001°', '±0.002°', '±0.003°', '±0.004°', '±0.005°',
      '±0.01°', '±0.02°', '±0.03°', '±0.04°', '±0.05°',
      '±0.1°', '±0.2°', '±0.3°', '±0.4°', '±0.5°',
      '±1°', '±2°', '±3°', '±4°', '±5°', '±10°',
      '±0.5 arcmin', '±1 arcmin', '±2 arcmin', '±5 arcmin',
      '±0.5 arcsec', '±1 arcsec', '±2 arcsec', '±5 arcsec',
      '±10 arcsec', '±30 arcsec', '±60 arcsec', 'Diğer'
    ],

    'Sıcaklık Ölçüm Cihazları': [
      '0°C', '±0.001°C', '±0.002°C', '±0.003°C', '±0.004°C', '±0.005°C',
      '±0.01°C', '±0.02°C', '±0.03°C', '±0.04°C', '±0.05°C',
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.4°C', '±0.5°C',
      '±1°C', '±2°C', '±3°C', '±4°C', '±5°C', '±10°C',
      '±0.01% FS', '±0.02% FS', '±0.05% FS', '±0.1% FS',
      '±0.2% FS', '±0.3% FS', '±0.4% FS', '±0.5% FS',
      '±1% FS', '±2% FS', '±3% FS', 'Diğer'
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

// Kategoriye göre cihaz adları listesi
const getEquipmentNamesByCategory = () => {
  const stored = localStorage.getItem('equipment_names_by_category');
  const version = localStorage.getItem('equipment_names_version');
  // Versiyon kontrolü - Yeni cihazlar eklendiğinde cache'i yenile
  if (stored && version === '2.0') {
    return JSON.parse(stored);
  }
  
  const defaultEquipmentNames = {
    'Ölçüm Cihazları': [
      // Boyut Ölçüm Cihazları
      'Kumpas - Digital', 'Kumpas - Analog', 'Kumpas - Abaküs', 'Kumpas - İç Çap',
      'Kumpas - Dış Çap', 'Kumpas - Derinlik', 'Kumpas - Yükseklik',
      'Mikrometre - Dış Çap', 'Mikrometre - İç Çap', 'Mikrometre - Derinlik',
      'Mikrometre - Dişli', 'Mikrometre - V-Blok', 'Mikrometre - Boru Duvar Kalınlığı',
      'Şerit Metre', 'Cetvel - Çelik', 'Cetvel - Alüminyum', 'Metre - Katlanır',
      'Yükseklik Ölçer - Digital', 'Yükseklik Ölçer - Analog',
      'Profil Ölçer', 'Çap Ölçer', 'Kalınlık Ölçer',
      'Komparatör - Digital', 'Komparatör - Analog', 'Komparatör - Pneumatik',
      'Blok Takımı', 'Pin Gauge Takımı', 'Ring Gauge Takımı',
      'Master Ring', 'Master Plug', 'Kalibre Blok',
      // Yeni Eklenen Ölçüm Cihazları
      'Takometre - Digital', 'Takometre - Laser', 'Takometre - Optik',
      'Sentil Çakısı - 0.001mm', 'Sentil Çakısı - 0.002mm', 'Sentil Çakısı - 0.005mm',
      'Radius Mastar - İç R', 'Radius Mastar - Dış R', 'Radius Mastar - Universal',
      'Dijital Isı Ölçer - İnfrared', 'Dijital Isı Ölçer - Temaslı', 'Dijital Isı Ölçer - Problu',
      // Hassas Ölçüm Cihazları
      'Koordinat Ölçüm Makinesi (CMM)', 'Optik Komparatör',
      'Projektör - Profil', 'Projektör - Werkstück',
      'Form Tester', 'Yüzey Pürüzlülük Cihazı',
      'Dişli Ölçüm Cihazı', 'Vida Ölçüm Cihazı'
    ],

    'Açı Ölçüm Cihazları': [
      'Açı Ölçer - Digital', 'Açı Ölçer - Analog', 
      'Gonyometre - Universal', 'Gonyometre - Ayarlanabilir',
      'İnklinometre - Digital', 'İnklinometre - Analog',
      'Su Terazisi - Standart', 'Su Terazisi - Hassas', 'Su Terazisi - Digital',
      'Niveau - Hava Kabarcıklı', 'Niveau - Magnetic',
      'Sinüs Bar', 'Açı Blokları', 'Konik Gauge',
      'Dönüş Masası', 'Endeksli Kafa', 'Açı Dekupatörü'
    ],

    'Sıcaklık Ölçüm Cihazları': [
      'Termometre - Digital', 'Termometre - Analog', 'Termometre - Cıvalı',
      'Termometre - Alkollü', 'Termometre - Bimetal',
      'PT100 - Sınıf A', 'PT100 - Sınıf B', 'PT1000',
      'Termoçift - K Tipi', 'Termoçift - J Tipi', 'Termoçift - T Tipi',
      'Termoçift - E Tipi', 'Termoçift - R Tipi', 'Termoçift - S Tipi',
      'Kızılötesi Termometre', 'Termal Kamera',
      'Sıcaklık Datalogger', 'Sıcaklık Kalibratörü',
      'Sıcaklık Banyosu - Sıvı', 'Sıcaklık Banyosu - Kuru Blok',
      'Fırın - Kalibrasyon', 'Soğutma Ünitesi - Kalibrasyon'
    ],

    'Test Ekipmanları': [
      'Multimetre - Digital', 'Multimetre - Analog',
      'Osiloskop - Digital', 'Osiloskop - Analog', 'Osiloskop - Mixed Signal',
      'Güç Analizörü', 'Güç Kaynağı - DC', 'Güç Kaynağı - AC',
      'Sinyal Generatörü - Fonksiyon', 'Sinyal Generatörü - RF',
      'Sinyal Generatörü - Darbe', 'Spektrum Analizörü',
      'Network Analizörü', 'LCR Metre', 'Kapasitans Metre',
      'İndüktans Metre', 'Direnç Metre - Düşük', 'Direnç Metre - Yüksek',
      'İzolasyon Test Cihazı', 'Hipot Test Cihazı',
      'Güç Kalitesi Analizörü', 'Harmonik Analizörü'
    ],

    'Üretim Makineleri': [
      'Torna Tezgahı - CNC', 'Torna Tezgahı - Konvansiyonel',
      'Freze Tezgahı - CNC', 'Freze Tezgahı - Konvansiyonel',
      'Kaynak Makinesi - TIG', 'Kaynak Makinesi - MIG/MAG',
      'Kaynak Makinesi - Elektrot', 'Kaynak Makinesi - Plazma',
      'Pres - Hidrolik', 'Pres - Mekanik', 'Pres - Pneumatik',
      'Şerit Testere', 'Daire Testere', 'Taşlama Tezgahı',
      'Delme Tezgahı', 'Honlama Tezgahı', 'Rayba Tezgahı',
      'Balata Makinesi', 'Büküm Makinesi', 'Kesme Makinesi'
    ],

    'Kalite Kontrol Cihazları': [
      'Sertlik Test Cihazı - Rockwell', 'Sertlik Test Cihazı - Brinell',
      'Sertlik Test Cihazı - Vickers', 'Sertlik Test Cihazı - Shore',
      'Çekme Test Cihazı', 'Basma Test Cihazı', 'Eğme Test Cihazı',
      'Darbe Test Cihazı - Charpy', 'Darbe Test Cihazı - Izod',
      'Yorulma Test Cihazı', 'Krip Test Cihazı',
      'Ultrasonik Test Cihazı', 'Manyetik Partikül Test Cihazı',
      'Penetrant Test Kiti', 'Radyografi Test Cihazı',
      'Endoskop', 'Borescope', 'Videoscope',
      'Optik Mikroskop', 'Elektron Mikroskop',
      'Stereomikroskop', 'Metalografi Mikroskop'
    ],

    'Kaynak Ekipmanları': [
      'Kaynak Makinesi - TIG AC/DC', 'Kaynak Makinesi - MIG/MAG',
      'Kaynak Makinesi - Elektrot', 'Kaynak Makinesi - Plazma Kesme',
      'Kaynak Makinesi - Lazer', 'Kaynak Makinesi - Elektron Işını',
      'Kaynak Teli Besleme Ünitesi', 'Gaz Flowmetre',
      'Gaz Karışım Ünitesi', 'Argon Regülatörü', 'CO2 Regülatörü',
      'Kaynak Torcu - TIG', 'Kaynak Torcu - MIG', 
      'Elektrot Tutucusu', 'Topraklama Kablosu',
      'Kaynak Ampermetre', 'Kaynak Voltmetre',
      'Ark Voltajı Ölçer', 'Kaynak Sıcaklık Ölçer'
    ],

    'Elektrikli Cihazlar': [
      'Motor - AC Asenkron', 'Motor - DC', 'Motor - Servo',
      'Motor - Step', 'Motor - Linear', 'Generator - AC',
      'Generator - DC', 'Transformatör - Güç', 'Transformatör - Ölçü',
      'Akım Trafosu', 'Gerilim Trafosu', 'Röle - Koruma',
      'Röle - Kontrol', 'Kontaktör', 'Sigorta - Güç',
      'Sigorta - Kontrol', 'Şalter - Ana', 'Şalter - Yardımcı',
      'Pano - Ana Dağıtım', 'Pano - Alt Dağıtım',
      'UPS - Kesintisiz Güç', 'Regülatör - Gerilim',
      'İnvertör - Frekans', 'Soft Starter', 'PLC - Kontrol',
      'HMI - Operatör Paneli', 'Enerji Analizörü'
    ],

    'Pnömatik Sistemler': [
      'Kompresör - Pistonlu', 'Kompresör - Vidalı', 'Kompresör - Santrifüj',
      'Hava Tankı', 'Hava Kurutucusu', 'Hava Filtresi',
      'Basınç Regülatörü', 'Basınç Şalteri', 'Basınç Transmitteri',
      'Pneumatik Silindir - Tek Etkili', 'Pneumatik Silindir - Çift Etkili',
      'Pneumatik Motor', 'Hava Dağıtım Valfi',
      'Hızlı Bağlantı', 'Hava Hortumu', 'Plastik Boru',
      'Sessize Alıcı', 'Hava Tabancası', 'Püskürme Tabancası'
    ],

    'Hidrolik Sistemler': [
      'Hidrolik Pompa - Dişli', 'Hidrolik Pompa - Piston',
      'Hidrolik Motor', 'Hidrolik Silindir - Tek Etkili',
      'Hidrolik Silindir - Çift Etkili', 'Hidrolik Tank',
      'Hidrolik Filtre', 'Hidrolik Soğutucu',
      'Basınç Valfi', 'Yön Kontrol Valfi', 'Akış Kontrol Valfi',
      'Basınç Transmitteri', 'Seviye Transmitteri',
      'Hidrolik Hortum', 'Hidrolik Boru', 'Hızlı Bağlantı',
      'Manometre - Gliserinli', 'Akümülatör - Mesane Tipi'
    ],

    'Bilgisayar ve IT': [
      'Bilgisayar - Masaüstü', 'Bilgisayar - Dizüstü', 'Tablet',
      'Server - Rack', 'Server - Tower', 'NAS - Network Storage',
      'Switch - Managed', 'Switch - Unmanaged', 'Router - Enterprise',
      'Firewall - Network', 'Access Point - WiFi', 'Modem - ADSL',
      'UPS - Bilgisayar', 'Monitör - LCD', 'Monitör - LED',
      'Printer - Lazer', 'Printer - Inkjet', 'Scanner - Flatbed',
      'Projektör - LCD', 'Projektör - DLP', 'Kamera - IP',
      'Mikrofon - Kondens', 'Hoparlör - Aktif'
    ],

    'Güvenlik Ekipmanları': [
      'Güvenlik Kamerası - IP', 'Güvenlik Kamerası - Analog',
      'DVR - Kayıt Cihazı', 'NVR - Network Kayıt',
      'Alarm Paneli', 'Hareket Sensörü', 'Kapı Sensörü',
      'Cam Kırılma Sensörü', 'Duman Dedektörü', 'Yangın Alarmı',
      'Gaz Dedektörü - Yanıcı', 'Gaz Dedektörü - Zehirli',
      'Karbonmonoksit Dedektörü', 'Sprinkler Sistemi',
      'Yangın Söndürme Tüpü', 'Yangın Dolabı',
      'Acil Çıkış Işığı', 'Güvenlik Işığı', 'İtfaiye Sireni'
    ],

    'Çevre Ölçüm Cihazları': [
      'Nem Ölçer - Digital', 'Nem Ölçer - Analog', 'Higrometre',
      'Lüksmetre - Digital', 'Lüksmetre - Analog', 'UV Metre',
      'Ses Seviyesi Ölçer', 'Titreşim Ölçer', 'Rüzgar Hızı Ölçer',
      'Barometer', 'Altimetre', 'Hava Kalitesi Ölçer',
      'CO2 Ölçer', 'CO Ölçer', 'O2 Ölçer', 'VOC Ölçer',
      'Partikül Sayıcı', 'Formaldehit Ölçer',
      'Radyasyon Ölçer - Alpha', 'Radyasyon Ölçer - Beta',
      'Radyasyon Ölçer - Gamma', 'Elektromanyetik Alan Ölçer'
    ],

    'Laboratuvar Ekipmanları': [
      'Hassas Terazi - 0.1mg', 'Hassas Terazi - 0.01mg', 'Hassas Terazi - 1mg',
      'Analitik Terazi - 0.1mg', 'Analitik Terazi - 0.01mg',
      'pH Metre - Masaüstü', 'pH Metre - Taşınabilir',
      'Conductivity Metre', 'TDS Metre', 'ORP Metre',
      'Spektrofotometre - UV/VIS', 'Spektrofotometre - IR',
      'Kromatografi - HPLC', 'Kromatografi - GC',
      'Mikroskop - Optik', 'Mikroskop - Stereo',
      'Centrifüj - Masaüstü', 'Centrifüj - Soğutmalı',
      'İnkübatör - CO2', 'İnkübatör - Normal', 'Etüv - Kurutma',
      'Autoklav - Steam', 'Soğutucu - Ultralow', 'Donduruk - -80°C'
    ],

    'Diğer': [
      'Diğer Ölçüm Cihazı', 'Özel Ölçüm Aleti', 'Prototip Cihaz'
    ]
  };
  
  localStorage.setItem('equipment_names_by_category', JSON.stringify(defaultEquipmentNames));
  localStorage.setItem('equipment_names_version', '2.0');
  return defaultEquipmentNames;
};

// Cihaz adları listesi (kullanıcı tarafından eklenenler kaydedilir)
const getEquipmentNames = (): string[] => {
  const stored = localStorage.getItem('equipment_names_list');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultNames = [
    'Kumpas', 'Mikrometre', 'Gönyemetre', 'Derinlik Mikrometresi', 'İç Çap Mikrometresi',
    'Dış Çap Mikrometresi', 'Yükseklik Ölçer', 'Çap Ölçer', 'Kalınlık Ölçer', 'Profil Ölçer',
    'Açı Ölçer', 'Gonyometre', 'Digital Açı Ölçer', 'İnklinometre', 'Niveau',
    'Termometre', 'Sıcaklık Sensörü', 'PT100', 'Termoçift', 'Kızılötesi Termometre',
    'Multimetre', 'Osiloskop', 'Güç Analizörü', 'Ohmmetre', 'Voltmetre', 'Ampermetre',
    'Manometre', 'Basınç Sensörü', 'Vakum Ölçer', 'Diferansiyel Basınç Ölçer',
    'Tartı', 'Hassas Terazi', 'Analitik Terazi', 'Platform Tartısı', 'Kanca Tartısı',
    'Nem Ölçer', 'Higrometre', 'pH Metre', 'Conductivity Metre', 'Lüksmetre',
    'Ses Seviyesi Ölçer', 'Titreşim Ölçer', 'Gaz Dedektörü', 'Oksijen Ölçer'
  ];
  
  localStorage.setItem('equipment_names_list', JSON.stringify(defaultNames));
  return defaultNames;
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

  // Component mount edildiğinde localStorage verilerini sadece bir kez yükle
  useEffect(() => {
    // Sadece ilk yüklemede verileri güncelle - temizleme yapmadan
    const updatedSubCategoryRanges = getMeasurementRangesBySubCategory();
    setMeasurementRangesBySubCategory(updatedSubCategoryRanges);
    
    const updatedRanges = getMeasurementRangesByCategory();
    setMeasurementRanges(updatedRanges);
    
    const updatedSubCategoryUncertainties = getMeasurementUncertaintiesBySubCategory();
    setMeasurementUncertaintiesBySubCategory(updatedSubCategoryUncertainties);
    
    const updatedUncertainties = getMeasurementUncertaintiesByCategory();
    setMeasurementUncertainties(updatedUncertainties);
  }, []); // Sadece component mount'ta çalışır



  // Helper fonksiyonlar için onChange handler'lar
  const handleCategoryChange = useCallback((newCategory: string) => {
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      name: '',
      measurementRange: '',
      measurementUncertainty: '',
      customMeasurementRange: '',
      customMeasurementUncertainty: ''
    }));
  }, []);

  const handleNameChange = useCallback((newName: string) => {
    setFormData(prev => ({
      ...prev,
      name: newName,
      measurementRange: '',
      measurementUncertainty: '',
      customMeasurementRange: '',
      customMeasurementUncertainty: ''
    }));
  }, []);

  // Throttled localStorage save fonksiyonu
  const throttledSaveToLocalStorage = useCallback((key: string, data: any) => {
    // Throttle için basit bir debounce implementasyonu
    clearTimeout((window as any)[`timeout_${key}`]);
    (window as any)[`timeout_${key}`] = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
    }, 300); // 300ms throttle
  }, []);

  // 🚀 PERFORMANCE: Enhanced filterOptions for autocomplete with virtualization
  const optimizedFilterOptions = useCallback((options: string[], params: any) => {
    const inputValue = params.inputValue.toLowerCase().trim();
    
    // Limit initial display for performance with large datasets (94 equipment)
    if (!inputValue) {
      return options.slice(0, 100); // Limit initial display to 100 items
    }
    
    // Fast string matching with early return for performance
    const filtered = options.filter(option => {
      return option.toLowerCase().includes(inputValue);
    });
    
    // Limit results to 50 items for optimal performance
    return filtered.slice(0, 50);
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
  const [equipmentNamesList, setEquipmentNamesList] = useState<string[]>(() => getEquipmentNames());
  const [calibrationCompaniesList, setCalibrationCompaniesList] = useState<string[]>(() => getCalibrationCompanies());
  
  // Kategoriye göre cihaz adları
  const [equipmentNamesByCategory, setEquipmentNamesByCategory] = useState<any>(() => getEquipmentNamesByCategory());
  
  // Ölçüm aralığı ve belirsizlik verileri
  const [measurementRanges, setMeasurementRanges] = useState<any>(() => getMeasurementRangesByCategory());
  const [measurementUncertainties, setMeasurementUncertainties] = useState<any>(() => getMeasurementUncertaintiesByCategory());
  const [measurementRangesBySubCategory, setMeasurementRangesBySubCategory] = useState<any>(() => getMeasurementRangesBySubCategory());
  const [measurementUncertaintiesBySubCategory, setMeasurementUncertaintiesBySubCategory] = useState<any>(() => getMeasurementUncertaintiesBySubCategory());
  
  // Dialog state'leri
  const [openManufacturerDialog, setOpenManufacturerDialog] = useState(false);
  const [openManufacturerManagementDialog, setOpenManufacturerManagementDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [openModelManagementDialog, setOpenModelManagementDialog] = useState(false);
  const [openEquipmentNameDialog, setOpenEquipmentNameDialog] = useState(false);
  const [openEquipmentNameManagementDialog, setOpenEquipmentNameManagementDialog] = useState(false);
  const [openCalibrationCompanyDialog, setOpenCalibrationCompanyDialog] = useState(false);
  
  // Ölçüm yönetimi dialog state'leri
  const [openMeasurementRangeManagementDialog, setOpenMeasurementRangeManagementDialog] = useState(false);
  const [openMeasurementUncertaintyManagementDialog, setOpenMeasurementUncertaintyManagementDialog] = useState(false);
  
  // Yeni ekleme için input state'leri
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newCalibrationCompany, setNewCalibrationCompany] = useState('');
  const [newMeasurementRange, setNewMeasurementRange] = useState('');
  const [newMeasurementUncertainty, setNewMeasurementUncertainty] = useState('');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // 🚀 PERFORMANCE: Memoized form handlers to prevent unnecessary re-renders
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Ölçüm aralığı seçimi için memoized helper fonksiyon
  const getMeasurementRangeOptions = useMemo(() => {
    // Önce cihaz adına göre özel aralıkları kontrol et
    if (formData.name && measurementRangesBySubCategory[formData.name]) {
      const subCategoryRanges = measurementRangesBySubCategory[formData.name];
      if (Array.isArray(subCategoryRanges) && subCategoryRanges.length > 0) {
        return subCategoryRanges;
      }
    }
    // Kategori bazlı aralıkları getir
    else if (formData.category) {
      const categoryRanges = measurementRanges[formData.category] || [];
      // Boş array ise varsayılan değerleri kullan
      return categoryRanges.length > 0 ? categoryRanges : (measurementRanges['Diğer'] || []);
    }
    // Hiçbir seçim yoksa boş array
    return [];
  }, [formData.name, formData.category, measurementRangesBySubCategory, measurementRanges]);

  // Ölçüm belirsizliği seçimi için memoized helper fonksiyon
  const getMeasurementUncertaintyOptions = useMemo(() => {
    // Önce cihaz adına göre özel belirsizlikleri kontrol et
    if (formData.name && measurementUncertaintiesBySubCategory[formData.name]) {
      const subCategoryUncertainties = measurementUncertaintiesBySubCategory[formData.name];
      if (Array.isArray(subCategoryUncertainties) && subCategoryUncertainties.length > 0) {
        return subCategoryUncertainties;
      }
    }
    // Kategori bazlı belirsizlikleri getir
    else if (formData.category) {
      const categoryUncertainties = measurementUncertainties[formData.category] || [];
      // Boş array ise varsayılan değerleri kullan
      return categoryUncertainties.length > 0 ? categoryUncertainties : (measurementUncertainties['Diğer'] || []);
    }
    // Hiçbir seçim yoksa boş array
    return [];
  }, [formData.name, formData.category, measurementUncertaintiesBySubCategory, measurementUncertainties]);

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Memoized filtered equipment list - sadece equipmentList veya filters değiştiğinde yeniden hesapla
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(equipment => {
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
  }, [equipmentList, filters]);

  // Memoized metrics calculation - sadece filteredEquipment değiştiğinde yeniden hesapla
  const metrics = useMemo(() => {

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
  }, [filteredEquipment]); // Sadece filteredEquipment değişikliğinde yeniden hesapla

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
      measurementRange: equipment.measurementRange || '',
      measurementUncertainty: equipment.measurementUncertainty || '',
      customMeasurementRange: equipment.customMeasurementRange || '',
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

  const handleSaveEquipmentName = () => {
    if (newEquipmentName.trim()) {
      const updatedList = [...equipmentNamesList, newEquipmentName.trim()];
      setEquipmentNamesList(updatedList);
      localStorage.setItem('equipment_names_list', JSON.stringify(updatedList));
      setNewEquipmentName('');
      setOpenEquipmentNameDialog(false);
    }
  };

  const handleDeleteEquipmentName = (name: string) => {
    if (window.confirm(`${name} cihaz adını listeden çıkarmak istediğinize emin misiniz?`)) {
      const updatedList = equipmentNamesList.filter(n => n !== name);
      setEquipmentNamesList(updatedList);
      localStorage.setItem('equipment_names_list', JSON.stringify(updatedList));
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
      // Mevcut aralıklarda var mı kontrol et
      const existingRanges = updatedRanges[formData.category] || [];
      if (!existingRanges.includes(range)) {
        updatedRanges[formData.category] = [...existingRanges, range];
        setMeasurementRanges(updatedRanges);
        throttledSaveToLocalStorage('measurement_ranges_by_category', updatedRanges);
        
        // Form'a otomatik seç
        setFormData(prev => ({...prev, measurementRange: range}));
      }
      
      setNewMeasurementRange('');
      setOpenMeasurementRangeManagementDialog(false);
    }
  };

  const handleDeleteMeasurementRange = (range: string) => {
    if (formData.category) {
      const updatedRanges = {...measurementRanges};
      updatedRanges[formData.category] = updatedRanges[formData.category].filter((r: string) => r !== range);
      setMeasurementRanges(updatedRanges);
      throttledSaveToLocalStorage('measurement_ranges_by_category', updatedRanges);
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
      // Mevcut belirsizliklerde var mı kontrol et
      const existingUncertainties = updatedUncertainties[formData.category] || [];
      if (!existingUncertainties.includes(uncertainty)) {
        updatedUncertainties[formData.category] = [...existingUncertainties, uncertainty];
        setMeasurementUncertainties(updatedUncertainties);
        throttledSaveToLocalStorage('measurement_uncertainties_by_category', updatedUncertainties);
        
        // Form'a otomatik seç
        setFormData(prev => ({...prev, measurementUncertainty: uncertainty}));
      }
      
      setNewMeasurementUncertainty('');
      setOpenMeasurementUncertaintyManagementDialog(false);
    }
  };

  const handleDeleteMeasurementUncertainty = (uncertainty: string) => {
    if (formData.category) {
      const updatedUncertainties = {...measurementUncertainties};
      updatedUncertainties[formData.category] = updatedUncertainties[formData.category].filter((u: string) => u !== uncertainty);
      setMeasurementUncertainties(updatedUncertainties);
      throttledSaveToLocalStorage('measurement_uncertainties_by_category', updatedUncertainties);
    }
  };

  // Form kaydetme fonksiyonu
  const handleSave = () => {
    // Yeni cihaz adını otomatik olarak listeye ekle
    if (formData.name && formData.name.trim() && !equipmentNamesList.includes(formData.name.trim())) {
      const updatedNames = [...equipmentNamesList, formData.name.trim()];
      setEquipmentNamesList(updatedNames);
      throttledSaveToLocalStorage('equipment_names_list', updatedNames);
    }

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
      throttledSaveToLocalStorage('equipment_calibration_data', updatedList);
    } else {
      // Yeni ekleme
      const updatedList = [...equipmentList, newEquipment];
      setEquipmentList(updatedList);
      throttledSaveToLocalStorage('equipment_calibration_data', updatedList);
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
      notes: '',
      measurementRange: '',
      measurementUncertainty: ''
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
                    onChange={(e) => handleFormChange('equipmentCode', e.target.value)}
                    required
                      error={!formData.equipmentCode?.trim()}
                      helperText={!formData.equipmentCode?.trim() ? "Ekipman kodu zorunludur" : ""}
                      placeholder="EQ-001, MEAS-001, CAL-001"
                  />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Autocomplete
                    fullWidth
                        options={formData.category ? (equipmentNamesByCategory[formData.category] || []) : equipmentNamesList}
                    value={formData.name || ''}
                        onChange={(_, newValue) => handleNameChange(newValue || '')}
                        disabled={!formData.category}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Cihazın Adı"
                    required
                            error={!formData.name?.trim()}
                            helperText={
                              !formData.category ? "Önce kategori seçiniz" :
                              !formData.name?.trim() ? "Cihaz adı zorunludur" : 
                              formData.category ? `${formData.category} kategorisine ait cihazlar gösteriliyor` : ""
                            }
                            placeholder={formData.category ? `${formData.category} cihazı ara... (örn: Kumpas - Digital, Mikrometre - Dış Çap)` : "Önce kategori seçin"}
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
                        filterOptions={optimizedFilterOptions}
                      />
                      <Tooltip title="Yeni cihaz adı ekle">
                    <Button 
                          variant="contained" 
                          onClick={() => setOpenEquipmentNameDialog(true)}
                          sx={{ minWidth: 50 }}
                          color="success"
                          disabled={!formData.category}
                        >
                          <AddIcon />
                    </Button>
                      </Tooltip>
                  </Box>
                </Box>
                
                  <TextField
                    fullWidth
                    label="Seri Numarası"
                    value={formData.serialNumber || ''}
                    onChange={(e) => handleFormChange('serialNumber', e.target.value)}
                    required
                    error={!formData.serialNumber?.trim()}
                    helperText={!formData.serialNumber?.trim() ? "Seri numarası zorunludur" : ""}
                    placeholder="ABC123456, SN-789456123"
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
                    <Autocomplete
                      options={EQUIPMENT_CATEGORIES}
                      value={formData.category || ''}
                      onChange={(_, newValue) => handleCategoryChange(newValue || '')}
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
                      filterOptions={optimizedFilterOptions}
                    />
                    
                    <Autocomplete
                      options={LOCATIONS}
                      value={formData.location || ''}
                      onChange={(_, newValue) => handleFormChange('location', newValue || '')}
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
                      filterOptions={optimizedFilterOptions}
                    />
                    
                    <Autocomplete
                      options={DEPARTMENTS}
                      value={formData.department || ''}
                      onChange={(_, newValue) => handleFormChange('department', newValue || '')}
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
                      filterOptions={optimizedFilterOptions}
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
                          onChange={(_, newValue) => handleFormChange('manufacturer', newValue || '')}
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
                          filterOptions={optimizedFilterOptions}
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
                
                      {/* Üretici Yönetimi */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Üretici yönet">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setOpenManufacturerManagementDialog(true)}
                            startIcon={<EditIcon />}
                            color="info"
                          >
                            Üretici Yönet
                          </Button>
                        </Tooltip>
                      </Box>
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
                      
                      {/* Model Yönetimi */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Model yönet">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setOpenModelManagementDialog(true)}
                            startIcon={<EditIcon />}
                            color="info"
                          >
                            Model Yönet
                          </Button>
                        </Tooltip>
                      </Box>
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
                          options={getMeasurementRangeOptions}
                          value={formData.measurementRange || ''}
                          onChange={(_, newValue) => {
                            setFormData({...formData, measurementRange: newValue || ''});
                          }}
                          disabled={!formData.category}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={formData.name ? `Ölçüm Aralığı (${formData.name}) *` : "Ölçüm Aralığı *"}
                              placeholder={formData.name ? `${formData.name} için aralık seçin...` : "Ölçüm aralığı seçin..."}
                              disabled={!formData.category}
                              helperText={
                                formData.name ? 
                                  `${formData.name} cihazına özel aralıklar gösteriliyor` : 
                                  formData.category ? 
                                    `${formData.category} kategorisine ait aralıklar gösteriliyor` : 
                                    "Önce kategori seçin"
                              }
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
                            
                            // Daha hassas filtreleme yapılacak
                            return options.filter((option: string) => {
                              const optionLower = option.toLowerCase();
                              // Tam eşleşme önceliği
                              if (optionLower === inputValue) return true;
                              // Başlangıç eşleşmesi
                              if (optionLower.startsWith(inputValue)) return true;
                              // İçerik eşleşmesi
                              if (optionLower.includes(inputValue)) return true;
                              // Sayısal değer eşleşmesi (sadece rakamları karşılaştır)
                              const optionNumbers = option.match(/\d+/g);
                              const inputNumbers = params.inputValue.match(/\d+/g);
                              if (optionNumbers && inputNumbers) {
                                return optionNumbers.some(num => inputNumbers.includes(num));
                              }
                              return false;
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
                          options={getMeasurementUncertaintyOptions}
                          value={formData.measurementUncertainty || ''}
                          onChange={(_, newValue) => {
                            setFormData({...formData, measurementUncertainty: newValue || ''});
                          }}
                          disabled={!formData.category}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={formData.name ? `Ölçüm Belirsizliği (${formData.name}) *` : "Ölçüm Belirsizliği *"}
                              placeholder={formData.name ? `${formData.name} için belirsizlik seçin...` : "Ölçüm belirsizliği seçin..."}
                              disabled={!formData.category}
                              helperText={
                                formData.name ? 
                                  `${formData.name} cihazına özel belirsizlikler gösteriliyor` : 
                                  formData.category ? 
                                    `${formData.category} kategorisine ait belirsizlikler gösteriliyor` : 
                                    "Önce kategori seçin"
                              }
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
                            
                            // Daha hassas filtreleme yapılacak
                            return options.filter((option: string) => {
                              const optionLower = option.toLowerCase();
                              // Tam eşleşme önceliği
                              if (optionLower === inputValue) return true;
                              // Başlangıç eşleşmesi
                              if (optionLower.startsWith(inputValue)) return true;
                              // İçerik eşleşmesi
                              if (optionLower.includes(inputValue)) return true;
                              // ± veya sayısal değer eşleşmesi
                              const optionNumbers = option.match(/[\d.]+/g);
                              const inputNumbers = params.inputValue.match(/[\d.]+/g);
                              if (optionNumbers && inputNumbers) {
                                return optionNumbers.some(num => inputNumbers.includes(num));
                              }
                              return false;
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
                      
                      {/* Laboratuvar Yönetimi */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Laboratuvar yönet">
                      <Button 
                        variant="outlined"
                            size="small"
                        onClick={() => setOpenCalibrationCompanyDialog(true)}
                            startIcon={<EditIcon />}
                            color="secondary"
                      >
                            Laboratuvar Yönet
                      </Button>
                        </Tooltip>
                      </Box>
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

      {/* Cihaz Adı Ekleme Dialogi */}
      <Dialog open={openEquipmentNameDialog} onClose={() => setOpenEquipmentNameDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Cihaz Adı Ekle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Cihaz Adı"
            value={newEquipmentName}
            onChange={(e) => setNewEquipmentName(e.target.value)}
            margin="dense"
            placeholder="Örn: Dijital Kumpas, Mikrometre, Termometre..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEquipmentNameDialog(false)}>İptal</Button>
          <Button 
            onClick={handleSaveEquipmentName} 
            variant="contained"
            disabled={!newEquipmentName.trim()}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cihaz Adı Yönetimi Dialogi */}
      <Dialog open={openEquipmentNameManagementDialog} onClose={() => setOpenEquipmentNameManagementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="info" />
            Cihaz Adları Yönetimi
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Yeni Cihaz Adı Ekle"
              value={newEquipmentName}
              onChange={(e) => setNewEquipmentName(e.target.value)}
              margin="dense"
              placeholder="Örn: Dijital Kumpas, Mikrometre, Termometre..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSaveEquipmentName}
                      disabled={!newEquipmentName.trim()}
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
            Kayıtlı Cihaz Adları ({equipmentNamesList.length})
          </Typography>
          
          {equipmentNamesList.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'grey.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz cihaz adı bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki alandan yeni cihaz adı ekleyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {equipmentNamesList.map((name, index) => (
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
                    <ScienceIcon color="info" fontSize="small" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {name}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteEquipmentName(name)}
                  >
                    Sil
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEquipmentNameManagementDialog(false)}>
            Kapat
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenEquipmentNameManagementDialog(false);
              setOpenEquipmentNameDialog(true);
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