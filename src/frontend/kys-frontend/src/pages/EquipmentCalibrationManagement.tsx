import React, { useState, useMemo } from 'react';
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
  responsiblePerson: string;
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
  cost: number;
  specifications: string;
  operatingManual: string;
  notes: string;
  qrCode?: string;
  images: string[];
  certificates: CalibrationCertificate[];
  maintenanceRecords: MaintenanceRecord[];
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
  cost: number;
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
  cost: number;
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
  'Kaynak Atölyesi',
  'Montaj Hattı',
  'Kalite Kontrol Lab',
  'Boyahane',
  'Makine İşleme',
  'Depo',
  'Elektrik Paneli',
  'Üretim Hattı 1',
  'Üretim Hattı 2',
  'Kesim Atölyesi',
  'Büro',
  'R&D Lab',
  'Test Sahası',
  'Dış Saha'
];

const DEPARTMENTS = [
  'Üretim',
  'Kalite Kontrol',
  'Bakım-Onarım',
  'R&D',
  'Satın Alma',
  'İnsan Kaynakları',
  'Finans',
  'Bilgi İşlem',
  'Güvenlik',
  'Çevre'
];

const RESPONSIBLE_PERSONS = [
  'Ahmet Yılmaz',
  'Mehmet Kaya',
  'Fatma Demir',
  'Ali Özkan',
  'Ayşe Şahin',
  'Mustafa Çelik',
  'Zehra Arslan',
  'Hasan Yıldız',
  'Emine Koç',
  'İbrahim Güzel'
];

// Removed unused constant CALIBRATION_STANDARDS

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
    responsiblePerson: '',
    status: 'active',
    calibrationRequired: false,
    calibrationFrequency: 12,
    maintenanceRequired: true,
    maintenanceFrequency: 6,
    criticalEquipment: false,
    cost: 0,
    specifications: '',
    notes: ''
  });

  // Sample data
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([
    {
      id: 'EQ-2024-001',
      equipmentCode: 'CAL-001',
      name: 'Dijital Kumpas',
      manufacturer: 'Mitutoyo',
      model: 'CD-15CPX',
      serialNumber: 'MT2024001',
      category: 'Ölçüm Cihazları',
      location: 'Kalite Kontrol Lab',
      department: 'Kalite Kontrol',
      responsiblePerson: 'Ahmet Yılmaz',
      purchaseDate: '2023-01-15',
      installationDate: '2023-01-20',
      warrantyExpiry: '2025-01-15',
      status: 'active',
      calibrationRequired: true,
      calibrationFrequency: 12,
      lastCalibrationDate: '2024-01-15',
      nextCalibrationDate: '2025-01-15',
      calibrationStatus: 'valid',
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      lastMaintenanceDate: '2024-07-01',
      nextMaintenanceDate: '2025-01-01',
      maintenanceStatus: 'good',
      criticalEquipment: true,
      cost: 2500,
      specifications: '0-150mm, ±0.02mm accuracy',
      operatingManual: 'manual_cal001.pdf',
      notes: 'Kritik ölçüm cihazı - günlük kontrol gerekli',
      images: [],
      certificates: [],
      maintenanceRecords: []
    },
    {
      id: 'EQ-2024-002',
      equipmentCode: 'WLD-005',
      name: 'MIG Kaynak Makinesi',
      manufacturer: 'Lincoln Electric',
      model: 'PowerMIG 350MP',
      serialNumber: 'LE2024005',
      category: 'Kaynak Ekipmanları',
      location: 'Kaynak Atölyesi',
      department: 'Üretim',
      responsiblePerson: 'Mehmet Kaya',
      purchaseDate: '2023-06-10',
      installationDate: '2023-06-15',
      warrantyExpiry: '2026-06-10',
      status: 'active',
      calibrationRequired: true,
      calibrationFrequency: 6,
      lastCalibrationDate: '2024-09-01',
      nextCalibrationDate: '2025-03-01',
      calibrationStatus: 'valid',
      maintenanceRequired: true,
      maintenanceFrequency: 3,
      lastMaintenanceDate: '2024-11-01',
      nextMaintenanceDate: '2025-02-01',
      maintenanceStatus: 'due',
      criticalEquipment: true,
      cost: 15000,
      specifications: '350A, 380V, MIG/MAG/Stick',
      operatingManual: 'manual_wld005.pdf',
      notes: 'Yüksek üretim hattı ekipmanı',
      images: [],
      certificates: [],
      maintenanceRecords: []
    },
    {
      id: 'EQ-2024-003',
      equipmentCode: 'TST-012',
      name: 'Ultrasonik Test Cihazı',
      manufacturer: 'Olympus',
      model: 'EPOCH 650',
      serialNumber: 'OL2024012',
      category: 'Test Ekipmanları',
      location: 'Kalite Kontrol Lab',
      department: 'Kalite Kontrol',
      responsiblePerson: 'Fatma Demir',
      purchaseDate: '2023-03-20',
      installationDate: '2023-03-25',
      warrantyExpiry: '2025-03-20',
      status: 'active',
      calibrationRequired: true,
      calibrationFrequency: 12,
      lastCalibrationDate: '2024-03-01',
      nextCalibrationDate: '2025-03-01',
      calibrationStatus: 'due',
      maintenanceRequired: true,
      maintenanceFrequency: 12,
      lastMaintenanceDate: '2024-03-01',
      nextMaintenanceDate: '2025-03-01',
      maintenanceStatus: 'good',
      criticalEquipment: true,
      cost: 8500,
      specifications: '0.5-635MHz, A-scan, B-scan capability',
      operatingManual: 'manual_tst012.pdf',
      notes: 'NDT Level 2 operatör gerekli',
      images: [],
      certificates: [],
      maintenanceRecords: []
    }
  ]);

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
      if (filters.responsiblePerson && equipment.responsiblePerson !== filters.responsiblePerson) return false;
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
    setDialogMode('create');
    setFormData({
      equipmentCode: '',
      name: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      category: '',
      location: '',
      department: '',
      responsiblePerson: '',
      status: 'active',
      calibrationRequired: false,
      calibrationFrequency: 12,
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      criticalEquipment: false,
      cost: 0,
      specifications: '',
      notes: ''
    });
    setActiveStep(0);
    setOpenDialog(true);
  };

  // ✅ İşlem butonları için fonksiyonlar eklendi
  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      equipmentCode: equipment.equipmentCode,
      name: equipment.name,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      location: equipment.location,
      department: equipment.department,
      responsiblePerson: equipment.responsiblePerson,
      status: equipment.status,
      calibrationRequired: equipment.calibrationRequired,
      calibrationFrequency: equipment.calibrationFrequency,
      maintenanceRequired: equipment.maintenanceRequired,
      maintenanceFrequency: equipment.maintenanceFrequency,
      criticalEquipment: equipment.criticalEquipment,
      cost: equipment.cost,
      specifications: equipment.specifications,
      notes: equipment.notes
    });
    setDialogMode('edit');
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCalibration = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('calibration');
    setOpenDialog(true);
  };

  const handleMaintenance = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('maintenance');
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
          {/* Filtreler */}
          <StyledAccordion
            expanded={expanded === 'filters'}
            onChange={handleAccordionChange('filters')}
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
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Ekipman Arama"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                    placeholder="Ekipman adı veya kodu ile arayın..."
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <MenuItem value="">Tüm Kategoriler</MenuItem>
                      {EQUIPMENT_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Lokasyon</InputLabel>
                    <Select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      <MenuItem value="">Tüm Lokasyonlar</MenuItem>
                      {LOCATIONS.map((location) => (
                        <MenuItem key={location} value={location}>{location}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Departman</InputLabel>
                    <Select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                    >
                      <MenuItem value="">Tüm Departmanlar</MenuItem>
                      {DEPARTMENTS.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Kalibrasyon Durumu</InputLabel>
                    <Select
                      value={filters.calibrationStatus}
                      onChange={(e) => handleFilterChange('calibrationStatus', e.target.value)}
                    >
                      <MenuItem value="">Tüm Durumlar</MenuItem>
                      <MenuItem value="valid">Geçerli</MenuItem>
                      <MenuItem value="due">Vadesi Yaklaşan</MenuItem>
                      <MenuItem value="overdue">Vadesi Geçen</MenuItem>
                      <MenuItem value="invalid">Geçersiz</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
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
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
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
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
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
              overflow: 'hidden',
              maxHeight: '70vh'
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
                      width: '120px',
                      minWidth: '120px'
                    }}
                  >
                    Sorumlu
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
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100px'
                        }}
                      >
                        {equipment.responsiblePerson}
                      </Typography>
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
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>ISO 10012 Uyumluluğu:</strong> Tüm kalibrasyonlar ulusal veya uluslararası ölçü standartlarına izlenebilir olmalıdır.
              Kalibrasyon sonuçları, ölçüm belirsizlikleri ve uygunluk değerlendirmeleri kaydedilmelidir.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Kalibrasyonlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Kalibrasyonlar
                </Typography>
                <List>
                  {equipmentList
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
                  {equipmentList
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
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>ISO 9001:2015 Madde 7.1.5:</strong> Ölçme ve izleme kaynaklarının, 
              geçerli sonuçlar sağlamak üzere uygun şekilde korunması ve bakımının yapılması gerekmektedir.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Bakımlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Bakımlar
                </Typography>
                <List>
                  {equipmentList
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
                  {equipmentList
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
                {equipmentList.filter(eq => eq.calibrationStatus === 'overdue').length > 0 && (
                  <Alert severity="error" sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2">
                      <strong>{equipmentList.filter(eq => eq.calibrationStatus === 'overdue').length}</strong> ekipmanın kalibrasyon vadesi geçmiş!
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
                        primary="5 Kalibrasyon İşlemi"
                        secondary="Toplam tahmini maliyet: ₺12,500"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BuildIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="8 Bakım İşlemi"
                        secondary="Toplam tahmini maliyet: ₺8,750"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ChecklistIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="12 Rutin Kontrol"
                        secondary="Haftalık kontroller"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>

              {/* Maliyet Takibi */}
              <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="secondary" />
                    Maliyet Takibi
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Bu Ay Kalibrasyon Maliyeti"
                        secondary={formatCurrency(25000)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Bu Ay Bakım Maliyeti"
                        secondary={formatCurrency(18500)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Yıllık Toplam Maliyet"
                        secondary={formatCurrency(285000)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Bütçe Kullanım Oranı"
                        secondary="68% (₺285,000 / ₺420,000)"
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Yeni Ekipman Ekle' :
           dialogMode === 'edit' ? 'Ekipman Düzenle' :
           dialogMode === 'calibration' ? 'Kalibrasyon Kaydı' :
           dialogMode === 'maintenance' ? 'Bakım Kaydı' : 'Ekipman Detayları'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'create' || dialogMode === 'edit' ? (
            <Box sx={{ mt: 2 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: Temel Bilgiler */}
                <Step>
                  <StepLabel>Temel Bilgiler</StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Ekipman Kodu *"
                          value={formData.equipmentCode || ''}
                          onChange={(e) => setFormData({...formData, equipmentCode: e.target.value})}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Ekipman Adı *"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Üretici"
                          value={formData.manufacturer || ''}
                          onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                        />
                        <TextField
                          fullWidth
                          label="Model"
                          value={formData.model || ''}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                        />
                        <TextField
                          fullWidth
                          label="Seri Numarası"
                          value={formData.serialNumber || ''}
                          onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth required>
                          <InputLabel>Kategori</InputLabel>
                          <Select
                            value={formData.category || ''}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                            {EQUIPMENT_CATEGORIES.map((category) => (
                              <MenuItem key={category} value={category}>{category}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                          <InputLabel>Lokasyon</InputLabel>
                          <Select
                            value={formData.location || ''}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                          >
                            {LOCATIONS.map((location) => (
                              <MenuItem key={location} value={location}>{location}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                          <InputLabel>Departman</InputLabel>
                          <Select
                            value={formData.department || ''}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                          >
                            {DEPARTMENTS.map((dept) => (
                              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth required>
                          <InputLabel>Sorumlu Kişi</InputLabel>
                          <Select
                            value={formData.responsiblePerson || ''}
                            onChange={(e) => setFormData({...formData, responsiblePerson: e.target.value})}
                          >
                            {RESPONSIBLE_PERSONS.map((person) => (
                              <MenuItem key={person} value={person}>{person}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Maliyet"
                          type="number"
                          value={formData.cost || 0}
                          onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>
                          }}
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(1)}
                          disabled={!formData.equipmentCode || !formData.name || !formData.category}
                        >
                          Sonraki
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 2: Kalibrasyon ve Bakım Ayarları */}
                <Step>
                  <StepLabel>Kalibrasyon ve Bakım Ayarları</StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.calibrationRequired || false}
                            onChange={(e) => setFormData({...formData, calibrationRequired: e.target.checked})}
                          />
                        }
                        label="Kalibrasyon Gerekli"
                      />
                      
                      {formData.calibrationRequired && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField
                            fullWidth
                            label="Kalibrasyon Periyodu (Ay)"
                            type="number"
                            value={formData.calibrationFrequency || 12}
                            onChange={(e) => setFormData({...formData, calibrationFrequency: parseInt(e.target.value) || 12})}
                            inputProps={{ min: 1, max: 60 }}
                          />
                        </Box>
                      )}

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.maintenanceRequired || false}
                            onChange={(e) => setFormData({...formData, maintenanceRequired: e.target.checked})}
                          />
                        }
                        label="Bakım Gerekli"
                      />
                      
                      {formData.maintenanceRequired && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField
                            fullWidth
                            label="Bakım Periyodu (Ay)"
                            type="number"
                            value={formData.maintenanceFrequency || 6}
                            onChange={(e) => setFormData({...formData, maintenanceFrequency: parseInt(e.target.value) || 6})}
                            inputProps={{ min: 1, max: 36 }}
                          />
                        </Box>
                      )}

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.criticalEquipment || false}
                            onChange={(e) => setFormData({...formData, criticalEquipment: e.target.checked})}
                          />
                        }
                        label="Kritik Ekipman"
                      />

                      <TextField
                        fullWidth
                        label="Teknik Özellikler"
                        multiline
                        rows={3}
                        value={formData.specifications || ''}
                        onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                        placeholder="Ekipmanın teknik özelliklerini giriniz..."
                      />

                      <TextField
                        fullWidth
                        label="Notlar"
                        multiline
                        rows={3}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Ek bilgiler ve notlar..."
                      />

                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(0)}>
                          Geri
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<SaveIcon />}
                          onClick={() => {
                            // Save logic here
                            const newEquipment = {
                              ...formData,
                              id: `EQ-${new Date().getFullYear()}-${String(equipmentList.length + 1).padStart(3, '0')}`,
                              purchaseDate: new Date().toISOString().split('T')[0],
                              installationDate: new Date().toISOString().split('T')[0],
                              warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0],
                              lastCalibrationDate: new Date().toISOString().split('T')[0],
                              nextCalibrationDate: new Date(Date.now() + (formData.calibrationFrequency || 12) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              calibrationStatus: 'valid' as const,
                              lastMaintenanceDate: new Date().toISOString().split('T')[0],
                              nextMaintenanceDate: new Date(Date.now() + (formData.maintenanceFrequency || 6) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              maintenanceStatus: 'good' as const,
                              images: [],
                              certificates: [],
                              maintenanceRecords: []
                            };
                            setEquipmentList([...equipmentList, newEquipment as Equipment]);
                            setOpenDialog(false);
                            setActiveStep(0);
                          }}
                        >
                          Kaydet
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="text.secondary">
                İçerik yakında eklenecek...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentCalibrationManagement; 