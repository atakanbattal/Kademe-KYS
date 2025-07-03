import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  AlertTitle,
  Skeleton,
  Snackbar,
  Grid,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Grow,
  Breadcrumbs,
  Link,
  Tooltip,
  Divider,
  Badge,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  MonetizationOn as MoneyIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Factory as FactoryIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  FilterList as FilterListIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { dataSyncManager } from '../utils/DataSyncManager';
import { useThemeContext } from '../context/ThemeContext';

// 🔍 BASİT VE STABİL ARAMA KUTUSU - Focus kaybı sorunu yok
const UltimateStableSearchInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}>(({ value, onChange, placeholder = "", label = "", size = "small", fullWidth = true }) => {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);
  
  // Update internal value when external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Simple input change handler with debounce
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debounced callback
    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);
  
  // Cleanup
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);
  
  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={inputValue}
      onChange={handleInputChange}
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
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: '2px',
          },
        },
      }}
    />
  );
});

// STYLED COMPONENTS
const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: theme.palette.background.default,
}));

const KPICard = styled(Card)<{ status: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return theme.palette.success.main;
      case 'good': return theme.palette.info.main;
      case 'warning': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  return {
    borderRadius: 12,
    background: `linear-gradient(145deg, ${getStatusColor()}15, ${getStatusColor()}05)`,
    border: `2px solid ${getStatusColor()}30`,
    position: 'relative',
    overflow: 'visible',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[8],
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: getStatusColor(),
      borderRadius: '12px 12px 0 0',
    }
  };
});

const ModuleCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, rgba(255,255,255,0.05))`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[16],
    borderColor: theme.palette.primary.main,
    cursor: 'pointer'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

// INTERFACES
interface KPIData {
  id: string;
  title: string;
  currentValue: number;
  targetValue?: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: string;
  description: string;
  history: { name: string; value: number }[];
}

interface ModuleData {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  description: string;
  status: 'operational' | 'warning' | 'error';
  lastUpdate: string;
  features: string[];
  usage: number;
  performance: number;
}

interface QuickStat {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

// HELPER FUNCTIONS
const formatValue = (value: number, unit: string): string => {
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === '₺') return `₺${value.toLocaleString('tr-TR')}`;
  if (unit === '/5') return `${value.toFixed(1)}/5`;
  return `${value.toFixed(1)} ${unit}`;
};

const getKPIStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return '#4CAF50';
    case 'good': return '#2196F3';
    case 'warning': return '#FF9800';
    case 'critical': return '#F44336';
    default: return '#757575';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUpIcon sx={{ color: '#4CAF50' }} />;
    case 'down': return <TrendingDownIcon sx={{ color: '#F44336' }} />;
    case 'stable': return <CheckCircleIcon sx={{ color: '#757575' }} />;
    default: return <CheckCircleIcon sx={{ color: '#757575' }} />;
  }
};

// REAL DATA GENERATORS
const generateQuickStats = (data: any): QuickStat[] => [
  { 
    id: 'qs-1', 
    title: 'Toplam DÖF', 
    value: data.dof.total.toString(), 
    change: Math.round(((data.dof.total - 15) / 15) * 100), 
    icon: <ErrorIcon />, 
    color: '#f44336' 
  },
  { 
    id: 'qs-2', 
    title: 'Kapalı DÖF', 
    value: data.dof.closed.toString(), 
    change: Math.round(((data.dof.closed - 8) / 8) * 100), 
    icon: <CheckCircleIcon />, 
    color: '#4caf50' 
  },
  { 
    id: 'qs-3', 
    title: 'Toplam Tetkik', 
    value: data.audits.total.toString(), 
    change: Math.round(((data.audits.total - 5) / 5) * 100), 
    icon: <ScheduleIcon />, 
    color: '#ff9800' 
  },
  { 
    id: 'qs-4', 
    title: 'Kalite Maliyeti', 
    value: `₺${Math.round(data.qualityCost.totalCost / 1000)}K`, 
    change: Math.round(((data.qualityCost.totalCost - 50000) / 50000) * 100), 
    icon: <MoneyIcon />, 
    color: '#2196f3' 
  }
];

// CHART DATA BASED ON REAL DATA
const generateChartData = (data: any): ChartData[] => [
  { name: 'DÖF Yönetimi', value: Math.max(50, 100 - (data.dof.total * 5)), fill: '#f44336' },
  { name: 'İç Tetkik', value: Math.max(60, 100 - (data.audits.total * 10)), fill: '#1976d2' },
  { name: 'Kalite Maliyet', value: Math.max(70, 100 - (data.qualityCost.totalCost / 1000)), fill: '#4caf50' },
  { name: 'Tedarikçi Kalite', value: Math.max(80, 100 - (data.suppliers.total * 3)), fill: '#ff9800' }
];

// MODULE DATA - Tema entegreli renk fonksiyonu
const getModuleData = (primaryColor: string): ModuleData[] => [
  {
    id: 'production-quality',
    name: 'Üretim Kalite Hata Takip',
    icon: <FactoryIcon />,
    color: primaryColor, // Ana tema rengi
    path: '/production-quality-tracking',
    description: 'Üretim sürecindeki kalite hatalarının takibi ve analizi',
    status: 'operational',
    lastUpdate: 'Az önce',
    features: ['Gerçek zamanlı', 'Trend analizi'],
    usage: 95,
    performance: 98
  },
  {
    id: 'internal-audit',
    name: 'İç Tetkik Yönetimi',
    icon: <AssignmentTurnedInIcon />,
    color: '#1976d2', // Mavi kalıyor (secondary)
    path: '/internal-audit-management',
    description: 'Kapsamlı iç tetkik planlama ve yönetim sistemi',
    status: 'operational',
    lastUpdate: 'Az önce',
    features: ['Soru listeleri', 'Rev. sistemi'],
    usage: 87,
    performance: 96
  },
  {
    id: 'dof-8d',
    name: 'DÖF ve 8D Yönetimi',
    icon: <BugReportIcon />,
    color: '#f44336', // Kırmızı kalıyor (hata rengi)
    path: '/dof-8d-management',
    description: 'Düzeltici ve önleyici faaliyet yönetimi',
    status: 'operational',
    lastUpdate: 'Az önce',
    features: ['8D metodolojisi', 'İstatistik'],
    usage: 92,
    performance: 94
  },
  {
    id: 'kpi-management',
    name: 'KPI Takip ve Yönetimi',
    icon: <SpeedIcon />,
    color: primaryColor, // Ana tema rengi
    path: '/quality-management',
    description: 'Performans göstergelerinin izlenmesi',
    status: 'operational',
    lastUpdate: 'Az önce',
    features: ['Dinamik dashboard', 'Trend'],
    usage: 89,
    performance: 97
  },
  {
    id: 'quality-cost',
    name: 'Kalite ve Araç Performans',
    icon: <MoneyIcon />,
    color: '#4caf50', // Yeşil kalıyor (başarı rengi)
    path: '/quality-cost-management',
    description: 'Kalite maliyetleri ve araç performans analizi',
    status: 'operational',
    lastUpdate: 'Az önce',
    features: ['Maliyet analizi', 'ROI'],
    usage: 84,
    performance: 93
  },
  {
    id: 'risk-management',
    name: 'Risk Yönetimi',
    icon: <BugReportIcon />,
    color: '#e91e63', // Pembe kalıyor (uyarı rengi)
    path: '/risk-management',
    description: 'Kapsamlı risk değerlendirme ve yönetimi',
    status: 'operational',
    lastUpdate: 'Az önce',
    features: ['Risk matrisi', 'Aksiyon'],
    usage: 76,
    performance: 91
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme: muiTheme, appearanceSettings } = useThemeContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // REAL DATA STATE
  const [centralData, setCentralData] = useState({
    dof: dataSyncManager.getDOFData(),
    suppliers: dataSyncManager.getSupplierData(),
    qualityCost: dataSyncManager.getQualityCostData(),
    vehicleQuality: dataSyncManager.getVehicleQualityData(),
    audits: dataSyncManager.getAuditData()
  });

  // UI STATE
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  
  // FILTER STATE
  const [filters, setFilters] = useState({
    searchTerm: '',
    moduleType: '',
    status: '',
    dateRange: '',
    priority: ''
  });
  const [filterExpanded, setFilterExpanded] = useState(false);

  // GENERATE KPI DATA FROM REAL DATA
  const generateKPIDataFromCentral = (): KPIData[] => {
    const generateHistory = (currentValue: number) => [
      { name: 'Pzt', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Sal', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Çar', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Per', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Cum', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Cmt', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Paz', value: currentValue }
    ];

    const dofEfficiency = centralData.dof.total > 0 ? (centralData.dof.closed / centralData.dof.total) * 100 : 100;
    const qualityCostRatio = centralData.qualityCost.totalCost / 100000 * 100;
    const supplierScore = Math.max(50, 100 - (centralData.suppliers.total * 2));
    const auditCompliance = centralData.audits.total > 0 ? Math.min(100, centralData.audits.total * 15) : 0;

    return [
      {
        id: 'kpi-1',
        title: 'DÖF Kapama Oranı',
        currentValue: dofEfficiency,
        targetValue: 85,
        unit: '%',
        status: dofEfficiency >= 85 ? 'excellent' : dofEfficiency >= 70 ? 'good' : dofEfficiency >= 50 ? 'warning' : 'critical',
        trend: dofEfficiency > 75 ? 'up' : 'down',
        trendValue: Math.abs(dofEfficiency - 75),
        category: 'Kalite',
        description: 'DÖF kapatma etkinliği',
        history: generateHistory(dofEfficiency)
      },
      {
        id: 'kpi-2',
        title: 'Kalite Maliyet Oranı',
        currentValue: qualityCostRatio,
        targetValue: 60,
        unit: '%',
        status: qualityCostRatio <= 60 ? 'excellent' : qualityCostRatio <= 80 ? 'good' : qualityCostRatio <= 100 ? 'warning' : 'critical',
        trend: qualityCostRatio < 80 ? 'up' : 'down',
        trendValue: Math.abs(qualityCostRatio - 80),
        category: 'Maliyet',
        description: 'Toplam maliyete oranla kalite maliyeti',
        history: generateHistory(qualityCostRatio)
      },
      {
        id: 'kpi-3',
        title: 'Tedarikçi Performansı',
        currentValue: supplierScore,
        targetValue: 90,
        unit: '/100',
        status: supplierScore >= 90 ? 'excellent' : supplierScore >= 75 ? 'good' : supplierScore >= 60 ? 'warning' : 'critical',
        trend: supplierScore > 80 ? 'up' : 'down',
        trendValue: Math.abs(supplierScore - 80),
        category: 'Tedarik',
        description: 'Tedarikçi kalite skorları',
        history: generateHistory(supplierScore)
      },
      {
        id: 'kpi-4',
        title: 'Tetkik Uyumluluğu',
        currentValue: auditCompliance,
        targetValue: 95,
        unit: '%',
        status: auditCompliance >= 95 ? 'excellent' : auditCompliance >= 80 ? 'good' : auditCompliance >= 65 ? 'warning' : 'critical',
        trend: auditCompliance > 75 ? 'up' : 'down',
        trendValue: Math.abs(auditCompliance - 75),
        category: 'Uygunluk',
        description: 'İç tetkik uygunluk oranı',
        history: generateHistory(auditCompliance)
      }
    ];
  };

  // UPDATE REAL DATA
  const updateCentralData = async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true);
      setError(null);

      // Veri zaten localStorage'dan geliyor, delay gereksiz
      const newCentralData = {
        dof: dataSyncManager.getDOFData(),
        suppliers: dataSyncManager.getSupplierData(),
        qualityCost: dataSyncManager.getQualityCostData(),
        vehicleQuality: dataSyncManager.getVehicleQualityData(),
        audits: dataSyncManager.getAuditData()
      };
      
      setCentralData(newCentralData);
      
      if (showLoading) {
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('Veri güncelleme sırasında hata oluştu');
      console.error('Dashboard güncelleme hatası:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  // EFFECTS
  useEffect(() => {
    // İlk yüklemede hızlı initialize
    updateCentralData();
    setIsLoading(false); // Hemen loading'i false yap
    
    const interval = setInterval(updateCentralData, 60000);
    dataSyncManager.subscribe('all', updateCentralData);
    
    return () => {
      clearInterval(interval);
      dataSyncManager.unsubscribe('all', updateCentralData);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        updateCentralData(false);
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // GET DYNAMIC DATA
  const kpiData = generateKPIDataFromCentral();
  const chartData = generateChartData(centralData);

  const statusPriority: { [key: string]: number } = {
    critical: 1,
    warning: 2,
    good: 3,
    excellent: 4,
  };

  const sortedKpiData = [...kpiData].sort((a, b) => {
    return statusPriority[a.status] - statusPriority[b.status];
  });

  // EVENT HANDLERS
  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };



  const handleRefresh = () => {
    updateCentralData(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Bildirimler için fonksiyonlar
  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
  };

  // Ayarlar için fonksiyonlar
  const handleSettingsClick = () => {
    console.log('Ayarlar açılıyor...');
    navigate('/settings');
  };

  const handleProfileClick = () => {
    console.log('Profil açılıyor...');
    // Profil modal'ı açabilir veya profil sayfasına yönlendirebilir
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      console.log('Çıkış yapılıyor...');
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      kpiData: generateKPIDataFromCentral(),
      moduleData: getModuleData(appearanceSettings.primaryColor),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ OPTIMIZED FILTER FUNCTIONS - useCallback ile performance artışı
  const getFilteredModules = React.useCallback(() => {
    const modules = getModuleData(appearanceSettings.primaryColor);
    return modules.filter(module => {
      const matchSearch = !filters.searchTerm || 
        module.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchStatus = !filters.status || module.status === filters.status;
      
      const matchType = !filters.moduleType || 
        (filters.moduleType === 'quality' && ['production-quality', 'dof-8d', 'kpi-management'].includes(module.id)) ||
        (filters.moduleType === 'audit' && ['internal-audit', 'risk-management'].includes(module.id)) ||
        (filters.moduleType === 'cost' && ['quality-cost'].includes(module.id));
      
      const matchPerformance = !filters.priority ||
        (filters.priority === 'high' && module.performance > 90) ||
        (filters.priority === 'medium' && module.performance >= 70 && module.performance <= 90) ||
        (filters.priority === 'low' && module.performance < 70);
      
      return matchSearch && matchStatus && matchType && matchPerformance;
    });
  }, [filters, appearanceSettings.primaryColor]);

  const clearFilters = React.useCallback(() => {
    setFilters({
      searchTerm: '',
      moduleType: '',
      status: '',
      dateRange: '',
      priority: ''
    });
  }, []);

  // LOADING SKELETON
  const KPISkeleton = () => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="text" width="90%" height={16} />
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <MainContainer>Yükleniyor...</MainContainer>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* PROFESSIONAL HEADER */}
      <Paper elevation={0} sx={{ 
        mb: 3, 
        p: 3, 
        background: `linear-gradient(135deg, ${appearanceSettings.primaryColor} 0%, ${muiTheme.palette.primary.dark} 100%)`,
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator="›" 
            sx={{ 
              mb: 2,
              '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiBreadcrumbs-ol': { alignItems: 'center' }
            }}
          >
            <Link 
              color="inherit" 
              href="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                opacity: 0.8,
                '&:hover': { opacity: 1 }
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Ana Sayfa
            </Link>
            <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <DashboardIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Dashboard
            </Typography>
          </Breadcrumbs>

          {/* Header Content */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                Kalite Yönetim Sistemi
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 1.5, fontSize: '0.9rem' }}>
                Gerçek Zamanlı İzleme ve Analiz Dashboard'u
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<TimelineIcon sx={{ fontSize: 14 }} />}
                  label="Canlı Veri" 
                  variant="outlined"
                  size="small"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '0.75rem',
                    height: 24,
                    '& .MuiChip-icon': { color: '#4caf50' }
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                  Son güncelleme: {new Date().toLocaleString('tr-TR')}
                </Typography>
              </Box>
            </Box>

            {/* Header Actions */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
              <Tooltip title="Bildirimleri Görüntüle">
                <IconButton 
                  onClick={handleNotificationsClick}
                  size="small"
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    width: 36,
                    height: 36,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon sx={{ fontSize: 18 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Verileri Yenile">
                <IconButton 
                  onClick={() => updateCentralData(true)}
                  disabled={isRefreshing}
                  size="small"
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    width: 36,
                    height: 36,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <RefreshIcon sx={{ 
                    fontSize: 18,
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Daha Fazla Seçenek">
                <IconButton 
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    width: 36,
                    height: 36,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <MoreVertIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 1
        }} />
      </Paper>

      {/* ERROR ALERT */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Sistem Hatası</AlertTitle>
          {error}
        </Alert>
      )}

      {/* FILTER PANEL */}
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Accordion expanded={filterExpanded} onChange={(e, expanded) => setFilterExpanded(expanded)}>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              background: `linear-gradient(135deg, ${appearanceSettings.primaryColor} 0%, ${appearanceSettings.primaryColor}dd 100%)`,
              color: 'white',
              '& .MuiAccordionSummary-expandIconWrapper': {
                color: 'white'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterListIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Filtreleme ve Arama
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Modülleri ve verileri filtreleyin
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Grid container spacing={3} alignItems="center">
              {/* Arama */}
              <Grid item xs={12} sm={6} md={3}>
                <UltimateStableSearchInput
                  value={filters.searchTerm}
                  onChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
                  label="Arama"
                  placeholder="Modül adı, açıklama..."
                  size="small"
                  fullWidth={true}
                />
              </Grid>

              {/* Modül Tipi */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Modül Tipi</InputLabel>
                  <Select
                    value={filters.moduleType}
                    label="Modül Tipi"
                    onChange={(e) => setFilters(prev => ({ ...prev, moduleType: e.target.value }))}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="quality">Kalite Modülleri</MenuItem>
                    <MenuItem value="audit">Tetkik Modülleri</MenuItem>
                    <MenuItem value="cost">Maliyet Modülleri</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Durum */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={filters.status}
                    label="Durum"
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="operational">Çalışıyor</MenuItem>
                    <MenuItem value="warning">Uyarı</MenuItem>
                    <MenuItem value="error">Hata</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Performans */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Performans</InputLabel>
                  <Select
                    value={filters.priority}
                    label="Performans"
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                                         <MenuItem value="high">Yüksek (&gt;90%)</MenuItem>
                     <MenuItem value="medium">Orta (70-90%)</MenuItem>
                     <MenuItem value="low">Düşük (&lt;70%)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Temizle Butonu */}
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  onClick={clearFilters}
                  sx={{ height: 40 }}
                >
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* PROFESSIONAL KPI CARDS */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Sistem Performans Göstergeleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerçek zamanlı sistem metrikleri ve trend analizi
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  Otomatik Yenileme
                </Typography>
              }
            />
            <Tooltip title="Analitik Görünümü">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {generateQuickStats(centralData).map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.id}>
              <Card sx={{ 
                height: 180,
                borderRadius: 2, 
                background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                  borderColor: stat.color
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: stat.color
                }
              }}>
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {stat.title}
                      </Typography>
                      <Box sx={{ 
                        width: 32, 
                        height: 32,
                        borderRadius: 2,
                        background: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Box sx={{ color: stat.color, fontSize: 16 }}>
                          {stat.icon}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="h4" fontWeight="bold" color={stat.color} sx={{ mb: 1, fontSize: '1.8rem' }}>
                      {stat.value}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 1,
                        backgroundColor: stat.change > 0 ? '#e8f5e8' : '#ffebee'
                      }}>
                        {stat.change > 0 ? (
                          <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 12 }} />
                        ) : (
                          <TrendingDownIcon sx={{ color: '#f44336', fontSize: 12 }} />
                        )}
                        <Typography 
                          variant="caption" 
                          color={stat.change > 0 ? '#4caf50' : '#f44336'}
                          sx={{ ml: 0.25, fontWeight: 600, fontSize: '0.7rem' }}
                        >
                          {Math.abs(stat.change)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        vs önceki dönem
                      </Typography>
                    </Box>
                  </Box>

                  {/* Mini Progress Indicator */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                        Bu Ay
                      </Typography>
                      <Typography variant="caption" color={stat.color} sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                        {Math.min(100, Math.max(0, 85 + Math.random() * 15)).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, Math.max(0, 85 + Math.random() * 15))}
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: `${stat.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                          borderRadius: 2
                        }
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* TABS */}
      <Card sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="KPI Genel Bakış" />
          <Tab label="Performans Grafikleri" />
        </Tabs>
        
        <CardContent sx={{ p: 3 }}>
          {/* KPI OVERVIEW */}
          {activeTab === 0 && (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 3 
            }}>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <KPISkeleton key={index} />
                ))
              ) : (
                sortedKpiData.map((kpi) => (
                  <KPICard key={kpi.id} status={kpi.status}>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {kpi.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {kpi.description}
                          </Typography>
                        </Box>
                        {getTrendIcon(kpi.trend)}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                        <Typography variant="h3" fontWeight={700} color={getKPIStatusColor(kpi.status)}>
                          {formatValue(kpi.currentValue, kpi.unit)}
                        </Typography>
                        {kpi.targetValue && (
                          <Typography variant="body2" color="text.secondary">
                            / {formatValue(kpi.targetValue, kpi.unit)}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Trend: 
                        </Typography>
                        <Chip 
                          label={`${kpi.trend === 'up' ? '+' : '-'}${kpi.trendValue.toFixed(1)}%`}
                          size="small" 
                          color={kpi.trend === 'up' ? 'success' : 'error'}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Haftalık Trend
                        </Typography>
                        <Box sx={{ height: 60, mt: 1 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={kpi.history}
                              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id={`color-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={getKPIStatusColor(kpi.status)} stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor={getKPIStatusColor(kpi.status)} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="value" stroke={getKPIStatusColor(kpi.status)} strokeWidth={2} fillOpacity={1} fill={`url(#color-${kpi.id})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>

                      <Box>
                        <Chip 
                          label={kpi.status === 'excellent' ? 'Mükemmel' : 
                                kpi.status === 'good' ? 'İyi' : 
                                kpi.status === 'warning' ? 'Uyarı' : 'Kritik'}
                          size="small"
                          color={kpi.status === 'excellent' || kpi.status === 'good' ? 'success' : 
                                 kpi.status === 'warning' ? 'warning' : 'error'}
                        />
                      </Box>
                    </CardContent>
                  </KPICard>
                ))
              )}
            </Box>
          )}

          {/* PERFORMANCE CHARTS */}
          {activeTab === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Modül Performansı</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Durum Dağılımı</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* PROFESSIONAL MODULE SECTION */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Kalite Yönetim Modülleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getFilteredModules().length} modül gösteriliyor
              {filters.searchTerm || filters.moduleType || filters.status || filters.priority ? 
                ` (${getModuleData(appearanceSettings.primaryColor).length} toplam modül)` : 
                ''
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
            <Tooltip title="Modül Filtresi">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Modül Bilgileri">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      
        <Grid container spacing={2}>
          {getFilteredModules().map((module, index) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <Card
                onClick={() => handleModuleClick(module.path)}
                sx={{ 
                  cursor: 'pointer',
                  height: 260,
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    borderColor: module.color,
                    '& .module-icon': {
                      transform: 'scale(1.05)',
                    },
                    '& .launch-icon': {
                      opacity: 1,
                      transform: 'translateX(0)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: module.color
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 2.5, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  {/* Header Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40,
                      borderRadius: 2,
                      background: `${module.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      className: 'module-icon',
                      flexShrink: 0
                    }}>
                      <Box sx={{ color: module.color, fontSize: 20 }}>
                        {module.icon}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Chip 
                        label={module.status === 'operational' ? 'Aktif' : 'Bakım'}
                        color={module.status === 'operational' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                      <IconButton 
                        size="small" 
                        className="launch-icon"
                        sx={{ 
                          opacity: 0,
                          transform: 'translateX(8px)',
                          transition: 'all 0.3s ease',
                          color: module.color,
                          width: 24,
                          height: 24
                        }}
                      >
                        <LaunchIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Title and Description */}
                  <Box sx={{ mb: 1.5, flexGrow: 1, minHeight: 0 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 0.5,
                        fontSize: '0.95rem',
                        lineHeight: 1.2,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {module.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.8rem',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {module.description}
                    </Typography>
                  </Box>

                  {/* Features */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                      Özellikler:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {module.features.slice(0, 2).map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.65rem',
                            height: 18,
                            borderColor: `${module.color}50`,
                            color: module.color,
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Performance Metrics */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                        Performans
                      </Typography>
                      <Typography variant="caption" color={module.color} sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                        {module.performance}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={module.performance} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: `${module.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: module.color,
                          borderRadius: 2
                        }
                      }} 
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {module.lastUpdate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Kullanım: {module.usage}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* MENUS */}

      {/* NOTIFICATIONS MENU */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
            maxHeight: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)'
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            Bildirimler
          </Typography>
          <Typography variant="caption" color="text.secondary">
            3 yeni bildirim
          </Typography>
        </Box>
        
        <MenuItem sx={{ py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            <ErrorIcon sx={{ mr: 1.5, color: 'error.main', mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Kritik DÖF Bildirimi
              </Typography>
              <Typography variant="caption" color="text.secondary">
                2 kritik DÖF kaydı 48 saattir açık
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                15 dakika önce
              </Typography>
            </Box>
          </Box>
        </MenuItem>

        <MenuItem sx={{ py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            <AssessmentIcon sx={{ mr: 1.5, color: 'warning.main', mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Kalite Raporu Hazır
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Haftalık kalite raporu oluşturuldu
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                1 saat önce
              </Typography>
            </Box>
          </Box>
        </MenuItem>

        <MenuItem sx={{ py: 1.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            <CheckCircleIcon sx={{ mr: 1.5, color: 'success.main', mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Tetkik Tamamlandı
              </Typography>
              <Typography variant="caption" color="text.secondary">
                İç tetkik başarıyla tamamlandı
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                3 saat önce
              </Typography>
            </Box>
          </Box>
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleNotificationsClose} sx={{ py: 1.5, px: 2, justifyContent: 'center' }}>
          <Typography variant="body2" color="primary" fontWeight={600}>
            Tüm Bildirimleri Görüntüle
          </Typography>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleExportData}>
          <DownloadIcon sx={{ mr: 1 }} />
          Verileri Dışa Aktar
        </MenuItem>
        <MenuItem onClick={handleRefresh}>
          <RefreshIcon sx={{ mr: 1 }} />
          Verileri Yenile
        </MenuItem>
      </Menu>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          Sistem verileri başarıyla güncellendi
        </Alert>
      </Snackbar>

      {/* PROFESSIONAL MENU */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)'
          }
        }}
      >
        <MenuItem onClick={handleExportData} sx={{ py: 1.5, px: 2 }}>
          <DownloadIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Verileri Dışa Aktar
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Excel formatında indir
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => updateCentralData(true)} sx={{ py: 1.5, px: 2 }}>
          <RefreshIcon sx={{ mr: 1.5, color: 'success.main' }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Verileri Yenile
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tüm modülleri güncelle
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleSettingsClick} sx={{ py: 1.5, px: 2 }}>
          <SettingsIcon sx={{ mr: 1.5, color: 'warning.main' }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Dashboard Ayarları
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Görünüm seçenekleri
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5, px: 2 }}>
          <PersonIcon sx={{ mr: 1.5, color: 'info.main' }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Profil Ayarları
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kullanıcı bilgileri
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
          <LogoutIcon sx={{ mr: 1.5, color: 'error.main' }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Çıkış Yap
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Güvenli çıkış
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard; 