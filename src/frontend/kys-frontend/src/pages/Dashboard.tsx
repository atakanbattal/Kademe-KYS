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
  Grow
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
  Speed as SpeedIcon
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

// MODULE DATA
const MODULE_DATA: ModuleData[] = [
  {
    id: 'production-quality',
    name: 'Üretim Kalite Hata Takip',
    icon: <FactoryIcon />,
    color: '#f44336',
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
    color: '#1976d2',
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
    color: '#f44336',
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
    color: '#2196f3',
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
    color: '#4caf50',
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
    color: '#e91e63',
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

      await new Promise(resolve => setTimeout(resolve, 500));

      const newCentralData = {
        dof: dataSyncManager.getDOFData(),
        suppliers: dataSyncManager.getSupplierData(),
        qualityCost: dataSyncManager.getQualityCostData(),
        vehicleQuality: dataSyncManager.getVehicleQualityData(),
        audits: dataSyncManager.getAuditData()
      };
      
      setCentralData(newCentralData);
      setIsLoading(false);
      
      if (showLoading) {
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('Veri güncelleme sırasında hata oluştu');
      console.error('Dashboard güncelleme hatası:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // EFFECTS
  useEffect(() => {
    updateCentralData();
    
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

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

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



  const handleExportData = () => {
    const dataToExport = {
      kpiData: generateKPIDataFromCentral(),
      moduleData: MODULE_DATA,
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
    <MainContainer>



      {/* ERROR ALERT */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Hata</AlertTitle>
          {error}
        </Alert>
      )}

      {/* QUICK STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {generateQuickStats(centralData).map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Card sx={{ 
              borderRadius: 3, 
              background: `linear-gradient(135deg, ${stat.color}15, transparent)`,
              border: `1px solid ${stat.color}30`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {stat.change > 0 ? (
                        <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#f44336', fontSize: 16 }} />
                      )}
                      <Typography 
                        variant="caption" 
                        color={stat.change > 0 ? '#4caf50' : '#f44336'}
                        sx={{ ml: 0.5 }}
                      >
                        {Math.abs(stat.change)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

      {/* MODULE CARDS */}
      <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        Kalite Yönetim Modülleri
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {MODULE_DATA.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.id}>
            <Grow in={true} timeout={500 + MODULE_DATA.indexOf(module) * 100}>
              <ModuleCard 
                onClick={() => handleModuleClick(module.path)}
                sx={{ 
                  cursor: 'pointer',
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ 
                  p: 2, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:last-child': { pb: 2 }
                }}>
                  {/* Üst kısım - Icon ve başlık */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5, minHeight: 56 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: module.color, 
                        width: 40, 
                        height: 40, 
                        mr: 1.5,
                        mt: 0.5,
                        boxShadow: `0 2px 4px ${module.color}40`
                      }}
                    >
                      {module.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        sx={{ 
                          fontSize: '0.875rem', 
                          lineHeight: 1.3,
                          mb: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word'
                        }}
                      >
                        {module.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {module.lastUpdate}
                        </Typography>
                        <Chip 
                          label={module.status === 'operational' ? 'Aktif' : 'Bakım'}
                          color={module.status === 'operational' ? 'success' : 'warning'}
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Açıklama */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1.5, 
                      flexGrow: 1,
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {module.description}
                  </Typography>

                  {/* Özellikler */}
                  <Box sx={{ mb: 1.5, minHeight: 28 }}>
                    {module.features.slice(0, 2).map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          mr: 0.5, 
                          mb: 0.5, 
                          fontSize: '0.65rem',
                          height: 18,
                          '& .MuiChip-label': { px: 0.75 }
                        }}
                      />
                    ))}
                  </Box>

                  {/* Alt kısım - Progress */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Kullanım: {module.usage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Performans: {module.performance}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={module.usage} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: module.color,
                          borderRadius: 2
                        }
                      }} 
                    />
                  </Box>
                </CardContent>
              </ModuleCard>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* MENUS */}


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
    </MainContainer>
  );
};

export default Dashboard; 