import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Stack,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  InputAdornment,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Autocomplete,
  Breadcrumbs,
  Link,
  Divider,
  Badge,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
// Timeline bileşenlerini @mui/lab'dan kaldırdım
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  DirectionsCar as DirectionsCarIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  Assessment as QualityControlIcon,
  Factory as FactoryIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  ReportProblem as ReportProblemIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { 
  Vehicle, 
  VehicleStatus, 
  DefectPriority, 
  DefectStatus,
  CreateVehicleData,
  CreateDefectData,
  VehicleFilters,
  DashboardStats,
  Warning,
  WarningSettings,
  VEHICLE_MODEL_CONFIG,
  DEPARTMENTS,
  DEFECT_CATEGORIES,
  STORAGE_KEYS,
  getVehicleStatusColor,
  getVehicleStatusLabel,
  getPriorityLabel,
  getPriorityColor,
  getShippedDate,
  getDefectStatusLabel,
  getDefectPriorityLabel,
  formatTurkishTime
} from '../services/vehicleQualityControlService';
import { vehicleQualityControlService } from '../services/vehicleQualityControlService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VehicleQualityControl: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [shipmentTab, setShipmentTab] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [warningSettings, setWarningSettings] = useState<WarningSettings[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ===== DIALOG STATES =====
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [vehicleEditDialogOpen, setVehicleEditDialogOpen] = useState(false);
  const [defectDialogOpen, setDefectDialogOpen] = useState(false);
  const [vehicleDetailDialogOpen, setVehicleDetailDialogOpen] = useState(false);
  const [warningSettingsDialogOpen, setWarningSettingsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleForDefect, setSelectedVehicleForDefect] = useState<Vehicle | null>(null);
  
  // ===== FORM STATES =====
  const [vehicleForm, setVehicleForm] = useState<CreateVehicleData>({
    vehicleName: '',
    vehicleModel: '',
    serialNumber: '',
    customerName: '',
    spsNumber: '',
    productionDate: new Date(),
    targetShipmentDate: undefined,
    dmoDate: undefined,
    description: '',
    priority: 'medium'
  });
  
  const [defectForm, setDefectForm] = useState<CreateDefectData>({
    category: '',
    subcategory: '',
    description: '',
    department: '',
    responsiblePerson: '',
    priority: DefectPriority.MEDIUM,
    notes: '',
    estimatedResolutionDate: undefined,
    reportedBy: 'Sistem Kullanıcısı'
  });
  
  // ===== FILTER & SEARCH STATES =====
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // ===== COMPUTED VALUES =====
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Arama terimi kontrolü
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          vehicle.vehicleName,
          vehicle.vehicleModel,
          vehicle.serialNumber,
          vehicle.customerName,
          vehicle.spsNumber
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Durum filtresi
      if (filters.status && vehicle.currentStatus !== filters.status) {
        return false;
      }

      // Model filtresi
      if (filters.model && vehicle.vehicleModel !== filters.model) {
        return false;
      }

      // Öncelik filtresi
      if (filters.priority && vehicle.priority !== filters.priority) {
        return false;
      }

      // Gecikme filtresi
      if (filters.isOverdue !== undefined && vehicle.isOverdue !== filters.isOverdue) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchTerm, filters]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredVehicles, page, rowsPerPage]);

  // ===== HELPER FUNCTIONS =====
  const getStatusColor = (status: VehicleStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case VehicleStatus.PRODUCTION: return 'info';
      case VehicleStatus.QUALITY_CONTROL: return 'warning';
      case VehicleStatus.RETURNED_TO_PRODUCTION: return 'error';
      case VehicleStatus.READY_FOR_SHIPMENT: return 'success';
      case VehicleStatus.SHIPPED: return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status: VehicleStatus): string => {
    return getVehicleStatusLabel(status);
  };

  const getDefectStatusLabel = (status: DefectStatus): string => {
    switch (status) {
      case DefectStatus.OPEN: return 'Açık';
      case DefectStatus.IN_PROGRESS: return 'Devam Ediyor';
      case DefectStatus.RESOLVED: return 'Çözüldü';
      case DefectStatus.CLOSED: return 'Kapatıldı';
      default: return 'Bilinmiyor';
    }
  };

  const getDefectPriorityLabel = (priority: DefectPriority): string => {
    switch (priority) {
      case DefectPriority.LOW: return 'Düşük';
      case DefectPriority.MEDIUM: return 'Orta';
      case DefectPriority.HIGH: return 'Yüksek';
      case DefectPriority.CRITICAL: return 'Kritik';
      default: return 'Bilinmiyor';
    }
  };

  const getShippedDate = (vehicle: Vehicle): Date | null => {
    const shippedEntry = vehicle.statusHistory.find(h => h.status === VehicleStatus.SHIPPED);
    return shippedEntry ? new Date(shippedEntry.date) : null;
  };

  const getProcessDuration = (vehicle: Vehicle): { quality: number; production: number; total: number } => {
    let qualityDays = 0;
    let productionDays = 0;

    // Kalite kontrol süresini hesapla
    const qualityEntries = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
    const qualityExits = vehicle.statusHistory.filter(h => 
      h.status === VehicleStatus.RETURNED_TO_PRODUCTION || 
      h.status === VehicleStatus.READY_FOR_SHIPMENT
    );

    qualityEntries.forEach((entry, index) => {
      const exit = qualityExits.find(e => new Date(e.date) > new Date(entry.date));
      if (exit) {
        qualityDays += Math.ceil((new Date(exit.date).getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
      } else if (vehicle.currentStatus === VehicleStatus.QUALITY_CONTROL) {
        qualityDays += Math.ceil((new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
      }
    });

    // Üretim süresini hesapla
    const productionEntries = vehicle.statusHistory.filter(h => 
      h.status === VehicleStatus.PRODUCTION || h.status === VehicleStatus.RETURNED_TO_PRODUCTION
    );
    const productionExits = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);

    productionEntries.forEach((entry, index) => {
      const exit = productionExits.find(e => new Date(e.date) > new Date(entry.date));
      if (exit) {
        productionDays += Math.ceil((new Date(exit.date).getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
      } else if (vehicle.currentStatus === VehicleStatus.PRODUCTION || vehicle.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION) {
        productionDays += Math.ceil((new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
      }
    });

    const totalDays = Math.ceil((new Date().getTime() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return { quality: qualityDays, production: productionDays, total: totalDays };
  };

  // ===== MODEL BASED VEHICLE NAMES =====
  const getVehicleNamesForModel = (model: string): string[] => {
    return VEHICLE_MODEL_CONFIG[model] || [];
  };

  // ===== FORM HANDLERS =====
  const resetVehicleForm = () => {
    setVehicleForm({
      vehicleName: '',
      vehicleModel: '',
      serialNumber: '',
      customerName: '',
      spsNumber: '',
      productionDate: new Date(),
      targetShipmentDate: undefined,
      dmoDate: undefined,
      description: '',
      priority: 'medium'
    });
    setSelectedVehicle(null);
  };

  const resetDefectForm = () => {
    setDefectForm({
      category: '',
      subcategory: '',
      description: '',
      department: '',
      responsiblePerson: '',
      priority: DefectPriority.MEDIUM,
      notes: '',
      estimatedResolutionDate: undefined,
      reportedBy: 'Sistem Kullanıcısı'
    });
  };

  // ===== DATA LOADING =====
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [stats, warningsList, settings, activities] = await Promise.all([
        vehicleQualityControlService.getDashboardStats(),
        vehicleQualityControlService.getWarnings(),
        vehicleQualityControlService.getWarningSettings(),
        Promise.resolve(vehicleQualityControlService.getRecentActivities(10))
      ]);
      setDashboardStats(stats);
      setWarnings(warningsList);
      setWarningSettings(settings);
      setRecentActivities(activities);
      
      console.log('Dashboard veriler yüklendi:', { 
        stats, 
        warningsList: warningsList.length, 
        settings: settings.length, 
        activities: activities.length,
        warningSettingTypes: settings.map(s => s.type)
      });
    } catch (err) {
      setError('Dashboard verileri yüklenirken hata oluştu');
      console.error('Dashboard yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const vehicleList = await vehicleQualityControlService.getAllVehicles();
      setVehicles(vehicleList);
    } catch (err) {
      setError('Araç listesi yüklenirken hata oluştu');
      console.error('Araç yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    // LocalStorage'daki geçersiz tarihleri temizle
    try {
      const activities = localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITIES);
      if (activities) {
        const parsedActivities = JSON.parse(activities);
        const validActivities = parsedActivities.filter((activity: any) => 
          activity.time && !isNaN(new Date(activity.time).getTime())
        );
        if (validActivities.length !== parsedActivities.length) {
          localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITIES, JSON.stringify(validActivities));
          console.log('Geçersiz tarihli aktiviteler temizlendi');
        }
      }
    } catch (error) {
      console.error('LocalStorage temizlik hatası:', error);
      localStorage.removeItem(STORAGE_KEYS.RECENT_ACTIVITIES); // Tamamen bozuksa sil
    }

    loadDashboardData();
    loadVehicles();
    
    // Uyarı ayarlarını direkt yükle ve eksik olanları ekle
    vehicleQualityControlService.getWarningSettings().then(settings => {
      // Eğer ayarlar eksikse, default ayarları yükle
      if (settings.length < 5) {
        console.log('Eksik uyarı ayarları tespit edildi, varsayılan ayarlar yükleniyor...');
        // Varsayılan ayarları localStorage'a kaydet
        const defaultSettings = [
          {
            id: '1',
            name: 'Üretim Geri Dönüş Uyarısı',
            type: 'production_return' as const,
            threshold: 2,
            unit: 'days' as const,
            level: 'warning' as const,
            isActive: true,
            description: 'Üretime geri gönderilip kaliteye dönmeyen araçlar için uyarı'
          },
          {
            id: '2', 
            name: 'Kritik Gecikme Uyarısı',
            type: 'production_return' as const,
            threshold: 5,
            unit: 'days' as const,
            level: 'critical' as const,
            isActive: true,
            description: 'Uzun süreli üretime takılı kalan araçlar için kritik uyarı'
          },
          {
            id: '3',
            name: 'Hedef Sevk Tarihi Yaklaşıyor',
            type: 'target_shipment' as const,
            threshold: 3,
            unit: 'days' as const,
            level: 'warning' as const,
            isActive: true,
            description: 'Müşteri hedef sevk tarihi yaklaşan araçlar için uyarı'
          },
          {
            id: '4',
            name: 'DMO Muayene Tarihi Yaklaşıyor',
            type: 'dmo_inspection' as const,
            threshold: 7,
            unit: 'days' as const,
            level: 'warning' as const,
            isActive: true,
            description: 'DMO muayene tarihi yaklaşan araçlar için uyarı'
          },
          {
            id: '5',
            name: 'DMO Muayene Tarihi Geçti',
            type: 'dmo_inspection' as const,
            threshold: 0,
            unit: 'days' as const,
            level: 'critical' as const,
            isActive: true,
            description: 'DMO muayene tarihi geçen araçlar için kritik uyarı'
          },
          {
            id: '6',
            name: 'Hedef Sevk Tarihi Geçti',
            type: 'target_shipment' as const,
            threshold: 0,
            unit: 'days' as const,
            level: 'critical' as const,
            isActive: true,
            description: 'Müşteri hedef sevk tarihi geçen araçlar için kritik uyarı'
          }
        ];
        
        localStorage.setItem(STORAGE_KEYS.WARNING_SETTINGS, JSON.stringify(defaultSettings));
        setWarningSettings(defaultSettings);
        console.log('Varsayılan uyarı ayarları yüklendi:', defaultSettings.map(s => `${s.name} (${s.type})`));
      } else {
        setWarningSettings(settings);
        console.log('Uyarı ayarları yüklendi:', settings.map(s => `${s.name} (${s.type})`));
      }
    }).catch(error => {
      console.error('Uyarı ayarları hatası:', error);
    });
  }, [loadDashboardData, loadVehicles]);

  // Filtre değişikliklerinde yeniden yükle
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // ===== VEHICLE OPERATIONS =====
  const handleVehicleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Form validasyonu
      if (!vehicleForm.vehicleName || !vehicleForm.vehicleModel || !vehicleForm.serialNumber || !vehicleForm.customerName) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }
      
      if (selectedVehicle) {
        await vehicleQualityControlService.updateVehicle(selectedVehicle._id, vehicleForm);
        setSuccess('Araç başarıyla güncellendi');
      } else {
        await vehicleQualityControlService.createVehicle(vehicleForm);
        setSuccess('Araç başarıyla eklendi');
      }
      
      setVehicleDialogOpen(false);
      resetVehicleForm();
      loadVehicles();
      loadDashboardData();
    } catch (err) {
      setError('Araç kaydedilirken hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  // DÖF oluşturma fonksiyonu
  const handleCreateDOF = (defect: any, vehicle: Vehicle | null) => {
    try {
      // DÖF modülü için uygun format hazırla
      const prefillData = {
        sourceModule: 'vehicleQualityControl',
        sourceRecordId: vehicle?._id || `defect_${Date.now()}`,
        prefillData: {
          title: `Araç Kalite Uygunsuzluğu - ${vehicle?.vehicleName || 'Bilinmeyen'} (${defect.category})`,
          description: `Araç Kalite Kontrol sürecinde uygunsuzluk tespit edildi.

Araç Bilgileri:
- Araç Adı: ${vehicle?.vehicleName || 'Bilinmeyen'}
- Model: ${vehicle?.vehicleModel || 'Bilinmeyen'}
- Seri No: ${vehicle?.serialNumber || 'Bilinmeyen'}
- Müşteri: ${vehicle?.customerName || 'Bilinmeyen'}
- Durum: ${vehicle ? getStatusText(vehicle.currentStatus) : 'Bilinmeyen'}

Eksiklik Detayları:
- Kategori: ${defect.category}
- Alt Kategori: ${defect.subcategory}
- Açıklama: ${defect.description}
- Öncelik: ${getDefectPriorityLabel(defect.priority)}
- Rapor Tarihi: ${defect.reportedDate ? format(new Date(defect.reportedDate), 'dd.MM.yyyy HH:mm') : 'Bilinmeyen'}
- Rapor Eden: ${defect.responsiblePerson || 'Bilinmeyen'}
- Departman: ${defect.department || 'Bilinmeyen'}

Bu uygunsuzluk için kök neden analizi ve düzeltici faaliyet planı gereklidir.`,
          department: defect.department || 'Kalite Kontrol',
          priority: defect.priority === 'critical' ? 'critical' : 
                   defect.priority === 'high' ? 'high' : 
                   defect.priority === 'medium' ? 'medium' : 'low',
          type: 'corrective',
          responsible: defect.responsiblePerson || 'Kalite Sorumlusu',
          rootCause: 'Araştırılacak - Araç kalite kontrol uygunsuzluğu',
          issueDescription: `${defect.category} - ${defect.subcategory}: ${defect.description}`,
          suggestedType: 'corrective'
        },
        recordData: {
          vehicle: vehicle,
          defect: defect
        }
      };

      // Prefill verisini localStorage'a kaydet
      localStorage.setItem('dof-form-prefill', JSON.stringify(prefillData));
      
      // DÖF8DManagement sayfasına yönlendir ve form açılmasını tetikle
      localStorage.setItem('dof-auto-open-form', 'true');
      window.location.href = '/dof-8d-management';
      
      setSuccess('DÖF modülüne yönlendiriliyorsunuz...');
    } catch (error) {
      setError('DÖF oluşturulurken hata oluştu');
      console.error('DÖF creation error:', error);
    }
  };

  const handleVehicleStatusUpdate = async (vehicleId: string, newStatus: VehicleStatus, notes?: string) => {
    try {
      setLoading(true);
      await vehicleQualityControlService.updateVehicleStatus(vehicleId, newStatus, notes);
      setSuccess(`Araç durumu "${getStatusText(newStatus)}" olarak güncellendi`);
      loadVehicles();
      loadDashboardData();
    } catch (err) {
      setError('Durum güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDefect = async () => {
    if (!selectedVehicleForDefect) {
      setError('Lütfen eksiklik raporu için bir araç seçin');
      return;
    }
    
    try {
      setLoading(true);
      
      // Form validasyonu
      if (!defectForm.category || !defectForm.subcategory || !defectForm.description || !defectForm.department) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }
      
      await vehicleQualityControlService.addDefect(selectedVehicleForDefect._id, defectForm);
      setSuccess(`${selectedVehicleForDefect.vehicleName} için eksiklik başarıyla eklendi`);
      setDefectDialogOpen(false);
      setSelectedVehicleForDefect(null);
      resetDefectForm();
      loadVehicles();
      loadDashboardData();
    } catch (err) {
      setError('Eksiklik eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToProduction = async (vehicleId: string) => {
    if (!defectForm.category || !defectForm.subcategory || !defectForm.description) {
      setError('Üretime geri döndürmek için eksiklik bilgilerini doldurmanız gerekli');
      setDefectDialogOpen(true);
      return;
    }

    try {
      setLoading(true);
      
      // Önce eksiklik ekle
      await vehicleQualityControlService.addDefect(vehicleId, defectForm);
      
      // Sonra durumu güncelle
      await vehicleQualityControlService.updateVehicleStatus(vehicleId, VehicleStatus.RETURNED_TO_PRODUCTION, defectForm.description);
      
      setSuccess('Araç eksikliklerle birlikte üretime geri gönderildi');
      setDefectDialogOpen(false);
      resetDefectForm();
      loadVehicles();
      loadDashboardData();
    } catch (err) {
      setError('Üretime geri gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // ===== WARNING OPERATIONS =====
  const handleWarningAcknowledge = async (warningId: string) => {
    try {
      await vehicleQualityControlService.acknowledgeWarning(warningId);
      setSuccess('Uyarı kapatıldı');
      loadDashboardData();
    } catch (err) {
      setError('Uyarı kapatılırken hata oluştu');
    }
  };

  const handleWarningSettingsUpdate = async () => {
    try {
      setLoading(true);
      await vehicleQualityControlService.updateWarningSettings(warningSettings);
      setSuccess('Uyarı ayarları güncellendi');
      setWarningSettingsDialogOpen(false);
      loadDashboardData();
    } catch (err) {
      setError('Uyarı ayarları güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // ===== CLEAR FILTERS =====
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(0);
  };

  // ===== RENDER FUNCTIONS =====
  const renderDashboard = () => (
    <Box sx={{ width: '100%' }}>
      {/* İstatistik kartları - Büyük ekran düzeni */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.totalVehicles || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Araç
                  </Typography>
                </Box>
                <DirectionsCarIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.inQualityControl || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Kalitede
                  </Typography>
                </Box>
                <QualityControlIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.inProduction || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Üretimde
                  </Typography>
                </Box>
                <FactoryIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.readyForShipment || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Sevke Hazır
                  </Typography>
                </Box>
                <ShippingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.shipped || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Sevk Edildi
                  </Typography>
                </Box>
                <ShippingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* İkinci satır - Performans kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff5722 0%, #d84315 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.overdueVehicles || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Geciken Araçlar
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #795548 0%, #5d4037 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatTurkishTime(dashboardStats?.avgQualityTime || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ort. Kalite Süresi
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatTurkishTime(dashboardStats?.avgProductionTime || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ort. Üretim Süresi
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatTurkishTime(dashboardStats?.avgShipmentTime || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ort. Sevk Süresi
                  </Typography>
                </Box>
                <ShippingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)', 
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardStats?.criticalDefects || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Kritik Eksiklikler
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detaylı listeler */}
      <Grid container spacing={3}>
        {/* Son Hareketler */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Son Hareketler
              </Typography>
              <List dense sx={{ flex: 1, maxHeight: '420px', overflowY: 'auto', pr: 1 }}>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} divider sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <Box sx={{ 
                        backgroundColor: activity.status ? getVehicleStatusColor(activity.status) : '#1976d2', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: 36, 
                        height: 36, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {activity.vehicleName ? activity.vehicleName.charAt(0) : 'A'}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>
                            {activity.vehicleName || 'Bilinmeyen Araç'} ({activity.serialNumber || 'N/A'})
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                            Müşteri: {activity.customerName || 'Bilinmiyor'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ color: '#1976d2', fontStyle: 'italic', mb: 0.5 }}>
                            {activity.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                            {activity.time && !isNaN(new Date(activity.time).getTime()) ? formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: tr }) : 'Tarih bilgisi yok'} - {activity.user}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {recentActivities.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                          Henüz hareket kaydı bulunmuyor
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Aktif Uyarılar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mb: 2 }}>
                Aktif Uyarılar
              </Typography>
              <List dense sx={{ flex: 1, maxHeight: '420px', overflowY: 'auto', pr: 1 }}>
                {warnings.slice(0, 8).map((warning) => {
                  const vehicle = vehicles.find(v => v._id === warning.vehicleId);
                  return (
                    <ListItem key={warning.id} divider sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <WarningIcon 
                          sx={{ 
                            color: warning.level === 'critical' ? '#f44336' : '#ff9800',
                            fontSize: '1.5rem'
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>
                              {vehicle ? `${vehicle.vehicleName} (${vehicle.serialNumber})` : 'Araç Bulunamadı'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                              Müşteri: {vehicle?.customerName || 'Bilinmiyor'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ color: warning.level === 'critical' ? '#f44336' : '#ff9800', mb: 0.5 }}>
                              {warning.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                              {warning.createdAt && !isNaN(new Date(warning.createdAt).getTime()) ? formatDistanceToNow(new Date(warning.createdAt), { addSuffix: true, locale: tr }) : 'Tarih bilgisi yok'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
                {warnings.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                          Aktif uyarı bulunmuyor
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Araç listesi render
  const renderVehicleList = () => (
    <Box sx={{ width: '100%' }}>
      {/* Arama ve filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Araç adı, seri no veya müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={filters.status || ''}
                label="Durum"
                onChange={(e) => setFilters({ ...filters, status: e.target.value as VehicleStatus || undefined })}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value={VehicleStatus.PRODUCTION}>Üretimde</MenuItem>
                <MenuItem value={VehicleStatus.QUALITY_CONTROL}>Kalitede</MenuItem>
                <MenuItem value={VehicleStatus.RETURNED_TO_PRODUCTION}>Üretime Döndü</MenuItem>
                <MenuItem value={VehicleStatus.READY_FOR_SHIPMENT}>Sevke Hazır</MenuItem>
                <MenuItem value={VehicleStatus.SHIPPED}>Sevk Edildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Model</InputLabel>
              <Select
                value={filters.model || ''}
                label="Model"
                onChange={(e) => setFilters({ ...filters, model: e.target.value || undefined })}
              >
                <MenuItem value="">Tümü</MenuItem>
                {Object.keys(VEHICLE_MODEL_CONFIG).map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              fullWidth
            >
              Filtreleri Temizle
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={() => {
                resetVehicleForm();
                setVehicleDialogOpen(true);
              }}
              startIcon={<AddIcon />}
              fullWidth
            >
              Yeni Araç
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Araç tablosu */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Araç Bilgileri</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Müşteri</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Öncelik</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Üretim Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Hızlı İşlemler</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2', textAlign: 'center' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle._id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {vehicle.vehicleName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {vehicle.vehicleModel} | {vehicle.serialNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{vehicle.customerName}</Typography>
                  {vehicle.spsNumber && (
                    <Typography variant="caption" color="textSecondary">
                      SPS: {vehicle.spsNumber}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getStatusText(vehicle.currentStatus)}
                    sx={{
                      backgroundColor: getVehicleStatusColor(vehicle.currentStatus),
                      color: 'white',
                      fontWeight: 'medium'
                    }}
                  />
                  {vehicle.isOverdue && (
                    <Chip
                      size="small"
                      label="Gecikme"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                                      <Chip 
                      size="small" 
                      label={getPriorityLabel(vehicle.priority)}
                      sx={{ 
                        backgroundColor: getPriorityColor(vehicle.priority),
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {vehicle.productionDate ? format(new Date(vehicle.productionDate), 'dd.MM.yyyy') : 'Tarih yok'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {vehicle.currentStatus === VehicleStatus.PRODUCTION && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.QUALITY_CONTROL)}
                      >
                        Kaliteye Al
                      </Button>
                    )}
                    {vehicle.currentStatus === VehicleStatus.QUALITY_CONTROL && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.RETURNED_TO_PRODUCTION)}
                        >
                          Üretime Döndür
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.READY_FOR_SHIPMENT)}
                        >
                          Sevke Hazır
                        </Button>
                      </>
                    )}
                    {vehicle.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.QUALITY_CONTROL)}
                      >
                        Kaliteye Döndür
                      </Button>
                    )}
                    {vehicle.currentStatus === VehicleStatus.READY_FOR_SHIPMENT && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.SHIPPED)}
                      >
                        Sevk Et
                      </Button>
                    )}
                  </Stack>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Detayları Görüntüle">
                      <IconButton
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setVehicleDetailDialogOpen(true);
                        }}
                        size="small"
                        sx={{ backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#bbdefb' } }}
                      >
                        <VisibilityIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eksiklik Ekle">
                      <IconButton
                        onClick={() => {
                          setSelectedVehicleForDefect(vehicle);
                          resetDefectForm();
                          setDefectDialogOpen(true);
                        }}
                        size="small"
                        sx={{ backgroundColor: '#fff3e0', '&:hover': { backgroundColor: '#ffe0b2' } }}
                      >
                        <ReportProblemIcon fontSize="small" color="warning" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton
                        onClick={() => handleVehicleEdit(vehicle)}
                        size="small"
                        sx={{ backgroundColor: '#e8f5e8', '&:hover': { backgroundColor: '#c8e6c9' } }}
                      >
                        <EditIcon fontSize="small" color="success" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => handleVehicleDelete(vehicle)}
                        size="small"
                        sx={{ backgroundColor: '#ffebee', '&:hover': { backgroundColor: '#ffcdd2' } }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredVehicles.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Araç bulunamadı
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Filtreleri değiştirin veya yeni araç ekleyin
            </Typography>
          </Box>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredVehicles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
    </Box>
  );

  // Kalite kontrol render
  const renderQualityControl = () => {
    const qualityVehicles = vehicles.filter(v => v.currentStatus === VehicleStatus.QUALITY_CONTROL);
    
    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{qualityVehicles.length}</Typography>
                <Typography variant="body2">Kalitede Bekleyen</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{formatTurkishTime(dashboardStats?.avgQualityTime || 0)}</Typography>
                <Typography variant="body2">Ortalama Test Süresi</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">Hidrolik</Typography>
                <Typography variant="body2">En Sık Eksiklik</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{dashboardStats?.qualityEfficiency || 0}%</Typography>
                <Typography variant="body2">Kalite Verimliliği</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Araç Bilgileri</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Kalitede Geçen Süre</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Eksiklikler</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualityVehicles.map((vehicle, index) => (
                <TableRow 
                  key={vehicle._id}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    borderBottom: index === qualityVehicles.length - 1 ? 'none' : '1px solid #e0e0e0'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        backgroundColor: '#ffa726', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: 40, 
                        height: 40, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {vehicle.vehicleName.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1a1a1a' }}>
                          {vehicle.vehicleName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                          Seri: {vehicle.serialNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', fontSize: '0.75rem' }}>
                          Müşteri: {vehicle.customerName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {vehicle.qualityStartDate && 
                        formatDistanceToNow(new Date(vehicle.qualityStartDate), { locale: tr })
                      }
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip 
                      size="small" 
                      label={getStatusText(vehicle.currentStatus)}
                      sx={{ 
                        backgroundColor: getVehicleStatusColor(vehicle.currentStatus),
                        color: 'white',
                        fontWeight: 'medium',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Badge badgeContent={vehicle.defects?.filter(d => d.status !== DefectStatus.CLOSED).length || 0} color="error">
                      <Chip 
                        size="small" 
                        label="Eksiklikler" 
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Badge>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.RETURNED_TO_PRODUCTION)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Üretime Döndür
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.READY_FOR_SHIPMENT)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Tamamla
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {qualityVehicles.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Kalitede araç bulunamadı
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Şu anda kalite kontrolde bekleyen araç bulunmamaktadır
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Box>
    );
  };

  // Üretim yönetimi render
  const renderProductionManagement = () => {
    const productionVehicles = vehicles.filter(v => v.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION);
    
    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{productionVehicles.length}</Typography>
                <Typography variant="body2">Üretimde Bekleyen</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{formatTurkishTime(dashboardStats?.avgProductionTime || 0)}</Typography>
                <Typography variant="body2">Ort. Çözüm Süresi</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">Kaynak</Typography>
                <Typography variant="body2">En Sık Dönüş Sebebi</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{dashboardStats?.inProduction || 0}</Typography>
                <Typography variant="body2">Aktif Çözümler</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Araç Bilgileri</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Üretimde Geçen Süre</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Çözülecek Eksiklikler</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productionVehicles.map((vehicle, index) => (
                <TableRow 
                  key={vehicle._id}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    borderBottom: index === productionVehicles.length - 1 ? 'none' : '1px solid #e0e0e0'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: 40, 
                        height: 40, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {vehicle.vehicleName.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1a1a1a' }}>
                          {vehicle.vehicleName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                          Seri: {vehicle.serialNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', fontSize: '0.75rem' }}>
                          Müşteri: {vehicle.customerName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {vehicle.productionReturnDate && 
                        formatDistanceToNow(new Date(vehicle.productionReturnDate), { locale: tr })
                      }
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip 
                      size="small" 
                      label={getStatusText(vehicle.currentStatus)}
                      sx={{ 
                        backgroundColor: getVehicleStatusColor(vehicle.currentStatus),
                        color: 'white',
                        fontWeight: 'medium',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Badge badgeContent={vehicle.defects?.filter(d => d.status !== DefectStatus.CLOSED).length || 0} color="warning">
                      <Chip 
                        size="small" 
                        label="Eksiklikler" 
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Badge>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.QUALITY_CONTROL)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Kaliteye Döndür
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {productionVehicles.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Üretimde araç bulunamadı
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Şu anda üretimde bekleyen araç bulunmamaktadır
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Box>
    );
  };

  // Sevk yönetimi render
  const renderShipmentManagement = () => {
    const readyVehicles = vehicles.filter(v => v.currentStatus === VehicleStatus.READY_FOR_SHIPMENT);
    const shippedVehicles = vehicles.filter(v => v.currentStatus === VehicleStatus.SHIPPED);
    
    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{readyVehicles.length}</Typography>
                <Typography variant="body2">Sevke Hazır</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{shippedVehicles.length}</Typography>
                <Typography variant="body2">Sevk Edildi</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">{dashboardStats?.monthlyShipped || 0}</Typography>
                <Typography variant="body2">Aylık Sevk</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">2.5 gün</Typography>
                <Typography variant="body2">Ort. Sevk Süresi</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Tabs value={shipmentTab} onChange={(e, newValue) => setShipmentTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Sevke Hazır" />
          <Tab label="Sevk Edildi" />
        </Tabs>

        {shipmentTab === 0 && (
          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Araç Bilgileri</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Hazır Tarihi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readyVehicles.map((vehicle, index) => (
                  <TableRow 
                    key={vehicle._id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      borderBottom: index === readyVehicles.length - 1 ? 'none' : '1px solid #e0e0e0'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          backgroundColor: '#4caf50', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 40, 
                          height: 40, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {vehicle.vehicleName.charAt(0)}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1a1a1a' }}>
                            {vehicle.vehicleName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                            Seri: {vehicle.serialNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.75rem' }}>
                            Müşteri: {vehicle.customerName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {(() => {
                          const readyDate = vehicle.statusHistory.find(h => h.status === VehicleStatus.READY_FOR_SHIPMENT)?.date;
                          return readyDate ? format(new Date(readyDate), 'dd.MM.yyyy HH:mm') : '-';
                        })()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        size="small" 
                        label="Sevke Hazır"
                        sx={{ 
                          backgroundColor: getVehicleStatusColor(vehicle.currentStatus),
                          color: 'white',
                          fontWeight: 'medium',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleVehicleStatusUpdate(vehicle._id, VehicleStatus.SHIPPED)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Sevk Et
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {readyVehicles.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  Sevke hazır araç bulunamadı
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Şu anda sevke hazır bekleyen araç bulunmamaktadır
                </Typography>
              </Box>
            )}
          </TableContainer>
        )}

        {shipmentTab === 1 && (
          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Araç Bilgileri</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Sevk Tarihi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Sevk Notları</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shippedVehicles.map((vehicle, index) => (
                  <TableRow 
                    key={vehicle._id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      borderBottom: index === shippedVehicles.length - 1 ? 'none' : '1px solid #e0e0e0'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          backgroundColor: '#2196f3', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 40, 
                          height: 40, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {vehicle.vehicleName.charAt(0)}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1a1a1a' }}>
                            {vehicle.vehicleName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                            Seri: {vehicle.serialNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.75rem' }}>
                            Müşteri: {vehicle.customerName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {(() => {
                          const shippedDate = getShippedDate(vehicle);
                          return shippedDate ? format(shippedDate, 'dd.MM.yyyy HH:mm') : '-';
                        })()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontStyle: vehicle.statusHistory.find(h => h.status === VehicleStatus.SHIPPED)?.notes ? 'normal' : 'italic' }}>
                        {vehicle.statusHistory.find(h => h.status === VehicleStatus.SHIPPED)?.notes || 'Not yok'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        size="small" 
                        label="Sevk Edildi"
                        sx={{ 
                          backgroundColor: getVehicleStatusColor(vehicle.currentStatus),
                          color: 'white',
                          fontWeight: 'medium',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {shippedVehicles.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  Sevk edilmiş araç bulunamadı
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Henüz sevk edilmiş araç bulunmamaktadır
                </Typography>
              </Box>
            )}
          </TableContainer>
        )}
      </Box>
    );
  };

  // Uyarılar render
  const renderWarnings = () => (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error">{warnings.length}</Typography>
              <Typography variant="body2">Aktif Uyarılar</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">{warnings.filter(w => w.level === 'critical').length}</Typography>
              <Typography variant="body2">Kritik Uyarılar</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">{dashboardStats?.overdueVehicles || 0}</Typography>
              <Typography variant="body2">Geciken Araçlar</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2">Uyarı Ayarları</Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setWarningSettingsDialogOpen(true)}
                startIcon={<SettingsIcon />}
              >
                Ayarla
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Araç Bilgileri</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Uyarı Tipi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Mesaj</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#1976d2' }}>Çözüm</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warnings.map((warning, index) => {
              const vehicle = vehicles.find(v => v._id === warning.vehicleId);
              return (
                <TableRow 
                  key={warning.id}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    borderBottom: index === warnings.length - 1 ? 'none' : '1px solid #e0e0e0'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: warning.level === 'critical' ? '#f44336' : '#ff9800',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                        {vehicle ? vehicle.vehicleName.charAt(0) : 'A'}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1a1a1a' }}>
                          {vehicle ? vehicle.vehicleName : 'Araç Bulunamadı'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                          Seri: {vehicle ? vehicle.serialNumber : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      size="small"
                      label={warning.level === 'critical' ? 'Kritik' : 'Normal'}
                      color={warning.level === 'critical' ? 'error' : 'warning'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {warning.message}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {warning.createdAt ? format(new Date(warning.createdAt), 'dd.MM.yyyy HH:mm') : 'Tarih yok'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {!warning.isAcknowledged ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleWarningAcknowledge(warning.id)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Çözüldü İşaretle
                      </Button>
                    ) : (
                      <Chip 
                        size="small" 
                        label="Çözüldü" 
                        color="success" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {warnings.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Aktif uyarı bulunamadı
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Şu anda sistem uyarısı bulunmamaktadır
            </Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );

  // Araç ekleme/düzenleme dialogu - düzeltilmiş
  const renderVehicleDialog = () => (
    <Dialog
      open={vehicleDialogOpen}
      onClose={() => setVehicleDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedVehicle ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={vehicleForm.vehicleModel}
                label="Model"
                onChange={(e) => {
                  const selectedModel = e.target.value;
                  setVehicleForm({
                    ...vehicleForm,
                    vehicleModel: selectedModel,
                    vehicleName: ''
                  });
                }}
              >
                {Object.keys(VEHICLE_MODEL_CONFIG).map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            {vehicleForm.vehicleModel === 'Özel (Manuel Giriş)' ? (
              <TextField
                fullWidth
                label="Özel Model Adı"
                value={vehicleForm.vehicleModel === 'Özel (Manuel Giriş)' ? '' : vehicleForm.vehicleModel}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleModel: e.target.value })}
                placeholder="Özel model adını girin"
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel>Araç Adı</InputLabel>
                <Select
                  value={vehicleForm.vehicleName}
                  label="Araç Adı"
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value })}
                  disabled={!vehicleForm.vehicleModel}
                >
                  {getVehicleNamesForModel(vehicleForm.vehicleModel).map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          {vehicleForm.vehicleName === 'Özel (Manuel Giriş)' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Özel Araç Adı"
                value={vehicleForm.vehicleName === 'Özel (Manuel Giriş)' ? '' : vehicleForm.vehicleName}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value })}
                placeholder="Özel araç adını girin"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Seri Numarası"
              value={vehicleForm.serialNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, serialNumber: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Müşteri Adı"
              value={vehicleForm.customerName}
              onChange={(e) => setVehicleForm({ ...vehicleForm, customerName: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SPS Numarası"
              value={vehicleForm.spsNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, spsNumber: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={vehicleForm.priority}
                label="Öncelik"
                onChange={(e) => setVehicleForm({ ...vehicleForm, priority: e.target.value as any })}
              >
                <MenuItem value="low">Düşük</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
                <MenuItem value="critical">Kritik</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Üretim Tarihi"
              type="date"
              value={vehicleForm.productionDate ? format(new Date(vehicleForm.productionDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setVehicleForm({ ...vehicleForm, productionDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setVehicleForm({ ...vehicleForm, productionDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: format(new Date(), 'yyyy-MM-dd') // Gelecek tarih girişini engelle
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hedef Müşteri Sevk Tarihi"
              type="date"
              value={vehicleForm.targetShipmentDate ? format(new Date(vehicleForm.targetShipmentDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setVehicleForm({ ...vehicleForm, targetShipmentDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setVehicleForm({ ...vehicleForm, targetShipmentDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{ shrink: true }}
              helperText="Müşteriye sevk edilmesi hedeflenen tarih"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="DMO Muayene Tarihi"
              type="date"
              value={vehicleForm.dmoDate ? format(new Date(vehicleForm.dmoDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setVehicleForm({ ...vehicleForm, dmoDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setVehicleForm({ ...vehicleForm, dmoDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{ shrink: true }}
              helperText="DMO muayene randevu tarihi"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={3}
              value={vehicleForm.description}
              onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setVehicleDialogOpen(false)}>
          İptal
        </Button>
        <Button 
          onClick={handleVehicleSubmit} 
          variant="contained"
          disabled={!vehicleForm.vehicleName || !vehicleForm.vehicleModel || !vehicleForm.serialNumber || !vehicleForm.customerName}
        >
          {selectedVehicle ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Araç düzenleme dialogu
  const renderVehicleEditDialog = () => (
    <Dialog
      open={vehicleEditDialogOpen}
      onClose={() => {
        setVehicleEditDialogOpen(false);
        setEditingVehicle(null);
        resetVehicleForm();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
        color: 'white',
        py: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EditIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Araç Düzenle
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Araç bilgilerini ve durumunu güncelle
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Araç Modeli</InputLabel>
              <Select
                value={vehicleForm.vehicleModel}
                label="Araç Modeli"
                onChange={(e) => {
                  const model = e.target.value as string;
                  setVehicleForm({ 
                    ...vehicleForm, 
                    vehicleModel: model,
                    vehicleName: model === 'Özel (Manuel Giriş)' ? vehicleForm.vehicleName : ''
                  });
                }}
              >
                {Object.keys(VEHICLE_MODEL_CONFIG).map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            {vehicleForm.vehicleModel === 'Özel (Manuel Giriş)' ? (
              <TextField
                fullWidth
                label="Araç Adı (Manuel)"
                value={vehicleForm.vehicleName}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value })}
                required
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel>Araç Adı</InputLabel>
                <Select
                  value={vehicleForm.vehicleName}
                  label="Araç Adı"
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value as string })}
                >
                  {VEHICLE_MODEL_CONFIG[vehicleForm.vehicleModel]?.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Seri Numarası"
              value={vehicleForm.serialNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, serialNumber: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Müşteri Adı"
              value={vehicleForm.customerName}
              onChange={(e) => setVehicleForm({ ...vehicleForm, customerName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SPS Numarası"
              value={vehicleForm.spsNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, spsNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Üretim Tarihi"
              type="date"
              value={vehicleForm.productionDate ? format(new Date(vehicleForm.productionDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setVehicleForm({ ...vehicleForm, productionDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setVehicleForm({ ...vehicleForm, productionDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: format(new Date(), 'yyyy-MM-dd') // Gelecek tarih girişini engelle
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={vehicleForm.priority}
                label="Öncelik"
                onChange={(e) => setVehicleForm({ ...vehicleForm, priority: e.target.value as any })}
              >
                <MenuItem value="low">Düşük</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
                <MenuItem value="critical">Kritik</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hedef Müşteri Sevk Tarihi"
              type="date"
              value={vehicleForm.targetShipmentDate ? format(new Date(vehicleForm.targetShipmentDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setVehicleForm({ ...vehicleForm, targetShipmentDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setVehicleForm({ ...vehicleForm, targetShipmentDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{ shrink: true }}
              helperText="Müşteriye sevk edilmesi hedeflenen tarih"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="DMO Muayene Tarihi"
              type="date"
              value={vehicleForm.dmoDate ? format(new Date(vehicleForm.dmoDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setVehicleForm({ ...vehicleForm, dmoDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setVehicleForm({ ...vehicleForm, dmoDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{ shrink: true }}
              helperText="DMO muayene randevu tarihi"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={3}
              value={vehicleForm.description}
              onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
            />
          </Grid>
          
          {editingVehicle && (
            <Grid item xs={12}>
              <Accordion 
                sx={{ 
                  borderRadius: '12px',
                  border: '1px solid #e3f2fd',
                  '&:before': { display: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    borderRadius: '12px',
                    bgcolor: '#f8f9fa',
                    minHeight: '48px',
                    '& .MuiAccordionSummary-content': {
                      margin: '8px 0'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" sx={{ fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Durum Yönetimi ve Tarih Düzenleme
                    </Typography>
                    <Chip 
                      label="Gelişmiş" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Mevcut Durum Yönetimi */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                        Mevcut Durum Bilgileri
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Mevcut Proses Adımı</InputLabel>
                            <Select
                              value={editingVehicle.currentStatus}
                              label="Mevcut Proses Adımı"
                              onChange={(e) => {
                                if (editingVehicle) {
                                  setEditingVehicle({ 
                                    ...editingVehicle, 
                                    currentStatus: e.target.value as VehicleStatus 
                                  });
                                }
                              }}
                            >
                              {Object.values(VehicleStatus).map((status) => (
                                <MenuItem key={status} value={status}>
                                  {getVehicleStatusLabel(status)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Mevcut Durum Başlangıç Tarihi"
                            type="datetime-local"
                            size="small"
                            value={(() => {
                              const currentStatusHistory = editingVehicle.statusHistory.find(h => h.status === editingVehicle.currentStatus);
                              if (currentStatusHistory && currentStatusHistory.date) {
                                try {
                                  return format(new Date(currentStatusHistory.date), "yyyy-MM-dd'T'HH:mm");
                                } catch (error) {
                                  console.error('Date formatting error:', error);
                                  return '';
                                }
                              }
                              return '';
                            })()}
                            onChange={(e) => {
                              if (editingVehicle && e.target.value) {
                                try {
                                  const newDate = new Date(e.target.value);
                                  if (!isNaN(newDate.getTime())) {
                                    const updatedHistory = editingVehicle.statusHistory.map(h =>
                                      h.status === editingVehicle.currentStatus 
                                        ? { ...h, date: newDate } 
                                        : h
                                    );
                                    
                                    // Eğer bu durum için geçmiş yoksa yeni bir kayıt ekle
                                    if (!updatedHistory.find(h => h.status === editingVehicle.currentStatus)) {
                                      updatedHistory.push({
                                        id: Date.now().toString(),
                                        status: editingVehicle.currentStatus,
                                        date: newDate,
                                        performedBy: 'Manuel Düzenleme',
                                        performedById: 'manual-edit',
                                        notes: 'Manuel tarih düzenlemesi'
                                      });
                                    }
                                    
                                    setEditingVehicle({ 
                                      ...editingVehicle, 
                                      statusHistory: updatedHistory,
                                      updatedAt: new Date()
                                    });
                                  }
                                } catch (error) {
                                  console.warn('Geçersiz tarih formatı:', e.target.value);
                                }
                              }
                            }}
                            InputLabelProps={{ shrink: true }}
                            helperText="Mevcut durumdaki başlangıç tarihini düzenleyin"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Tüm İşlem Tarihleri */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                        Kronolojik İşlem Geçmişi ({editingVehicle.statusHistory.length} adet işlem)
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Aracın tüm durum değişikliklerinin kronolojik sırası. En eskiden en yeniye doğru sıralanmıştır.
                      </Typography>
                      
                      {editingVehicle.statusHistory.length > 0 ? (
                        <Box sx={{ 
                          maxHeight: '500px', 
                          overflowY: 'auto', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          bgcolor: '#fafafa'
                        }}>
                          <List sx={{ p: 2 }}>
                            {editingVehicle.statusHistory
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .map((history, index) => {
                                const originalIndex = editingVehicle.statusHistory.findIndex(h => 
                                  h.status === history.status && 
                                  h.date === history.date &&
                                  h.performedBy === history.performedBy
                                );
                                
                                return (
                                  <ListItem 
                                    key={`${history.status}-${originalIndex}-${index}`}
                                    sx={{ 
                                      mb: 2,
                                      p: 0,
                                      display: 'block'
                                    }}
                                  >
                                    <Card sx={{ 
                                      border: history.status === editingVehicle.currentStatus ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                      borderRadius: '12px',
                                      bgcolor: history.status === editingVehicle.currentStatus ? '#e3f2fd' : '#ffffff',
                                      boxShadow: history.status === editingVehicle.currentStatus ? '0 4px 12px rgba(25,118,210,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                                      position: 'relative',
                                      '&:before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        backgroundColor: getVehicleStatusColor(history.status),
                                        borderTopLeftRadius: '12px',
                                        borderBottomLeftRadius: '12px'
                                      }
                                    }}>
                                      <CardContent sx={{ p: 3 }}>
                                        {/* İşlem Başlığı */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                              width: 32,
                                              height: 32,
                                              borderRadius: '50%',
                                              backgroundColor: '#1976d2',
                                              color: 'white',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '0.875rem',
                                              fontWeight: 'bold'
                                            }}>
                                              {index + 1}
                                            </Box>
                                                                                         <Box>
                                               <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>
                                                 {index + 1}. Aşama: {getVehicleStatusLabel(history.status)}
                                               </Typography>
                                               <Typography variant="caption" color="textSecondary">
                                                 {(() => {
                                                   const startDate = history.date;
                                                   let endDate;
                                                   
                                                   if (history.status === editingVehicle.currentStatus) {
                                                     return `${startDate ? format(new Date(startDate), 'dd.MM.yyyy HH:mm') : ''} → Devam ediyor`;
                                                   } else {
                                                     const sortedHistory = editingVehicle.statusHistory
                                                       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                     const nextHistory = sortedHistory[index + 1];
                                                     endDate = nextHistory ? new Date(nextHistory.date) : null;
                                                     
                                                     return `${startDate ? format(new Date(startDate), 'dd.MM.yyyy HH:mm') : 'Bilinmiyor'} → ${endDate ? format(endDate, 'dd.MM.yyyy HH:mm') : 'Belirtilmedi'}`;
                                                   }
                                                 })()}
                                               </Typography>
                                             </Box>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip 
                                              size="small"
                                              label={getVehicleStatusLabel(history.status)}
                                              sx={{ 
                                                backgroundColor: getVehicleStatusColor(history.status),
                                                color: 'white',
                                                fontWeight: 'medium',
                                                fontSize: '0.75rem'
                                              }}
                                            />
                                            {history.status === editingVehicle.currentStatus && (
                                              <Chip 
                                                size="small" 
                                                label="MEVCUT DURUM" 
                                                color="primary" 
                                                variant="filled"
                                                sx={{ 
                                                  fontSize: '0.7rem',
                                                  fontWeight: 'bold',
                                                  backgroundColor: '#1976d2',
                                                  color: 'white'
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </Box>

                                        {/* Giriş-Çıkış Tarihleri */}
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} md={6}>
                                            <TextField
                                              fullWidth
                                              label={`${getVehicleStatusLabel(history.status)} - GİRİŞ Tarihi`}
                                              type="datetime-local"
                                              size="small"
                                              value={history.date ? format(new Date(history.date), "yyyy-MM-dd'T'HH:mm") : ''}
                                              onChange={(e) => {
                                                if (e.target.value) {
                                                  try {
                                                    const newDate = new Date(e.target.value);
                                                    if (!isNaN(newDate.getTime())) {
                                                      const updatedHistory = [...editingVehicle.statusHistory];
                                                      updatedHistory[originalIndex] = {
                                                        ...updatedHistory[originalIndex],
                                                        date: newDate
                                                      };
                                                      
                                                      setEditingVehicle({
                                                        ...editingVehicle,
                                                        statusHistory: updatedHistory,
                                                        updatedAt: new Date()
                                                      });
                                                    }
                                                  } catch (error) {
                                                    console.warn('Geçersiz tarih formatı:', e.target.value);
                                                  }
                                                }
                                              }}
                                              InputLabelProps={{ shrink: true }}
                                              sx={{
                                                '& .MuiOutlinedInput-root': {
                                                  borderRadius: '8px',
                                                  backgroundColor: '#e8f5e8'
                                                }
                                              }}
                                            />
                                          </Grid>
                                          <Grid item xs={12} md={6}>
                                            <TextField
                                              fullWidth
                                              label={`${getVehicleStatusLabel(history.status)} - ÇIKIŞ Tarihi`}
                                              type="datetime-local"
                                              size="small"
                                              value={(() => {
                                                // Bir sonraki işlemin giriş tarihi bu işlemin çıkış tarihi
                                                const sortedHistory = editingVehicle.statusHistory
                                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                const nextHistory = sortedHistory[index + 1];
                                                
                                                if (nextHistory && nextHistory.date) {
                                                  return format(new Date(nextHistory.date), "yyyy-MM-dd'T'HH:mm");
                                                }
                                                
                                                // Eğer mevcut durum ise çıkış tarihi yok
                                                if (history.status === editingVehicle.currentStatus) {
                                                  return '';
                                                }
                                                
                                                // Çıkış tarihi belirlenmemişse boş
                                                return '';
                                              })()}
                                                                                            onChange={(e) => {
                                                // Çıkış tarihi sadece görüntüleme amaçlı, düzenleme yapılmıyor
                                                console.log('Çıkış tarihi düzenleme henüz desteklenmiyor');
                                              }}
                                              InputLabelProps={{ shrink: true }}
                                              disabled={history.status === editingVehicle.currentStatus}
                                              placeholder={history.status === editingVehicle.currentStatus ? 'Devam ediyor...' : 'Çıkış tarihi girin'}
                                              sx={{
                                                '& .MuiOutlinedInput-root': {
                                                  borderRadius: '8px',
                                                  backgroundColor: history.status === editingVehicle.currentStatus ? '#f5f5f5' : '#ffe8e8'
                                                }
                                              }}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="İşlem Notları"
                                              multiline
                                              rows={2}
                                              size="small"
                                              value={history.notes || ''}
                                              onChange={(e) => {
                                                const updatedHistory = [...editingVehicle.statusHistory];
                                                updatedHistory[originalIndex] = {
                                                  ...updatedHistory[originalIndex],
                                                  notes: e.target.value
                                                };
                                                
                                                setEditingVehicle({
                                                  ...editingVehicle,
                                                  statusHistory: updatedHistory,
                                                  updatedAt: new Date()
                                                });
                                              }}
                                              placeholder={`${getVehicleStatusLabel(history.status)} aşaması ile ilgili notlar...`}
                                              sx={{ 
                                                '& .MuiOutlinedInput-root': {
                                                  borderRadius: '8px',
                                                  backgroundColor: '#ffffff'
                                                }
                                              }}
                                            />
                                          </Grid>
                                        </Grid>

                                        {/* Süre ve Durum Bilgisi */}
                                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                          <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                              <Typography variant="caption" color="textSecondary">
                                                <strong>Bu aşamada geçirilen süre:</strong><br/>
                                                {(() => {
                                                  const startDate = history.date;
                                                  let endDate;
                                                  
                                                  // Çıkış tarihi belirleme
                                                  if (history.status === editingVehicle.currentStatus) {
                                                    endDate = new Date(); // Mevcut durum için şu anki zaman
                                                  } else {
                                                    const sortedHistory = editingVehicle.statusHistory
                                                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                    const nextHistory = sortedHistory[index + 1];
                                                    endDate = nextHistory ? new Date(nextHistory.date) : (history.exitDate ? new Date(history.exitDate) : new Date());
                                                  }
                                                  
                                                  if (startDate && endDate) {
                                                    const diffMs = endDate.getTime() - new Date(startDate).getTime();
                                                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                                    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                                    
                                                    if (diffDays > 0) {
                                                      return `${diffDays} gün, ${diffHours} saat, ${diffMinutes} dakika`;
                                                    } else if (diffHours > 0) {
                                                      return `${diffHours} saat, ${diffMinutes} dakika`;
                                                    } else {
                                                      return `${diffMinutes} dakika`;
                                                    }
                                                  }
                                                  return 'Hesaplanamıyor';
                                                })()}
                                                {history.status === editingVehicle.currentStatus && ' (devam ediyor)'}
                                              </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{
                                                  width: 12,
                                                  height: 12,
                                                  borderRadius: '50%',
                                                  backgroundColor: '#4caf50'
                                                }} />
                                                <Typography variant="caption" color="textSecondary">
                                                  <strong>Giriş:</strong> {history.date ? format(new Date(history.date), 'dd.MM.yyyy HH:mm') : 'Bilinmiyor'}
                                                </Typography>
                                              </Box>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                <Box sx={{
                                                  width: 12,
                                                  height: 12,
                                                  borderRadius: '50%',
                                                  backgroundColor: history.status === editingVehicle.currentStatus ? '#ff9800' : '#f44336'
                                                }} />
                                                <Typography variant="caption" color="textSecondary">
                                                  <strong>Çıkış:</strong> {(() => {
                                                    if (history.status === editingVehicle.currentStatus) {
                                                      return 'Devam ediyor...';
                                                    }
                                                    const sortedHistory = editingVehicle.statusHistory
                                                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                                    const nextHistory = sortedHistory[index + 1];
                                                    if (nextHistory && nextHistory.date) {
                                                      return format(new Date(nextHistory.date), 'dd.MM.yyyy HH:mm');
                                                    }
                                                    return history.exitDate ? format(new Date(history.exitDate), 'dd.MM.yyyy HH:mm') : 'Belirtilmedi';
                                                  })()}
                                                </Typography>
                                              </Box>
                                            </Grid>
                                          </Grid>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </ListItem>
                                );
                              })}
                          </List>
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: '8px' }}>
                          <Typography variant="body2">
                            Henüz işlem geçmişi bulunmuyor. Araç ilk kez kaydedildikten sonra durum değişiklikleri burada görünecektir.
                          </Typography>
                        </Alert>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                        <Typography variant="body2">
                          <strong>Önemli Uyarı:</strong> Tarih değişiklikleri şunları etkileyecektir:
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          <li>Uyarı sistemi hesaplamaları</li>
                          <li>Performans raporları ve istatistikler</li>
                          <li>Süreç takip metrikleri</li>
                          <li>DÖF ve uygunsuzluk kayıtları</li>
                        </ul>
                        <Typography variant="body2">
                          Lütfen değişiklikleri yapmadan önce bu etkileri göz önünde bulundurun.
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={() => {
            setVehicleEditDialogOpen(false);
            setEditingVehicle(null);
            resetVehicleForm();
          }}
          variant="outlined"
          startIcon={<CloseIcon />}
        >
          İptal
        </Button>
        <Button
          onClick={handleVehicleUpdate}
          variant="contained"
          color="primary"
          disabled={loading || !vehicleForm.vehicleName || !vehicleForm.serialNumber || !vehicleForm.customerName}
          startIcon={<SaveIcon />}
        >
          {loading ? 'Güncelleniyor...' : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Eksiklik raporlama dialogu
  const renderDefectDialog = () => (
    <Dialog
      open={defectDialogOpen}
      onClose={() => {
        setDefectDialogOpen(false);
        setSelectedVehicleForDefect(null);
        resetDefectForm();
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white',
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <ReportProblemIcon />
        Eksiklik Raporla
        {selectedVehicleForDefect && (
          <Typography variant="subtitle2" sx={{ ml: 1, opacity: 0.9 }}>
            - {selectedVehicleForDefect.vehicleName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {selectedVehicleForDefect && (
            <Grid item xs={12}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '1px solid #1976d2',
                borderRadius: '8px'
              }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DirectionsCarIcon sx={{ color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      {selectedVehicleForDefect.vehicleName}
                    </Typography>
                    <Chip
                      label={selectedVehicleForDefect.serialNumber}
                      size="small"
                      sx={{ backgroundColor: '#1976d2', color: 'white' }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
                    Müşteri: {selectedVehicleForDefect.customerName} | Model: {selectedVehicleForDefect.vehicleModel}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={defectForm.category}
                label="Kategori"
                onChange={(e) => setDefectForm({ ...defectForm, category: e.target.value as string, subcategory: '' })}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              >
                {Object.keys(DEFECT_CATEGORIES).map((key) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ErrorIcon fontSize="small" color="warning" />
                      {key}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Alt Kategori</InputLabel>
              <Select
                value={defectForm.subcategory}
                label="Alt Kategori"
                onChange={(e) => setDefectForm({ ...defectForm, subcategory: e.target.value as string })}
                disabled={!defectForm.category}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              >
                {DEFECT_CATEGORIES[defectForm.category]?.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BuildIcon fontSize="small" color="info" />
                      {sub}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Eksiklik Açıklaması"
              multiline
              rows={4}
              value={defectForm.description}
              onChange={(e) => setDefectForm({ ...defectForm, description: e.target.value })}
              required
              placeholder="Eksikliğin detaylı açıklamasını yazınız..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Departman</InputLabel>
              <Select
                value={defectForm.department}
                label="Departman"
                onChange={(e) => setDefectForm({ ...defectForm, department: e.target.value as string })}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              >
                {DEPARTMENTS.map((dep) => (
                  <MenuItem key={dep} value={dep}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FactoryIcon fontSize="small" color="primary" />
                      {dep}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rapor Eden"
              value={defectForm.reportedBy}
              onChange={(e) => setDefectForm({ ...defectForm, reportedBy: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tahmini Çözüm Tarihi"
              type="date"
              value={defectForm.estimatedResolutionDate ? format(new Date(defectForm.estimatedResolutionDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                try {
                  if (e.target.value && e.target.value.length >= 8) {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setDefectForm({ ...defectForm, estimatedResolutionDate: newDate });
                    }
                  } else if (!e.target.value) {
                    setDefectForm({ ...defectForm, estimatedResolutionDate: undefined });
                  }
                } catch (error) {
                  console.warn('Geçersiz tarih formatı:', e.target.value);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: format(new Date(), 'yyyy-MM-dd') // Geçmiş tarih girişini engelle
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
              helperText="Eksikliğin ne zaman giderileceği tahmini"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2, backgroundColor: '#f8f9fa' }}>
        <Button 
          onClick={() => {
            setDefectDialogOpen(false);
            setSelectedVehicleForDefect(null);
            resetDefectForm();
          }}
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          sx={{ 
            borderRadius: '8px',
            minWidth: '120px',
            textTransform: 'none',
            fontSize: '0.95rem'
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleAddDefect}
          variant="contained"
          disabled={!selectedVehicleForDefect || !defectForm.category || !defectForm.subcategory || !defectForm.description || !defectForm.department}
          startIcon={<ReportProblemIcon />}
          sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            borderRadius: '8px',
            minWidth: '160px',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
            },
            '&:disabled': {
              background: '#cccccc',
              color: '#888888'
            }
          }}
        >
          Eksiklik Raporla
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Uyarı ayarları dialogu - Detaylandırılmış
  const renderWarningSettingsDialog = () => (
    <Dialog
      open={warningSettingsDialogOpen}
      onClose={() => setWarningSettingsDialogOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #FF9800, #FFC107)',
        color: 'white',
        py: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Uyarı Sistemi Ayarları
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Uyarı koşullarını ve eşik değerlerini detaylı şekilde yapılandırın
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Genel Bilgilendirme */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e3f2fd', bgcolor: '#f3f9ff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PriorityHighIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Uyarı Sistemi Bilgileri
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FactoryIcon color="warning" />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Üretim Süreci Uyarıları
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Kaliteden üretime gönderilen araçların belirlenen süre içinde geri dönmemesi durumunda uyarı verir.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ShippingIcon color="error" />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Sevk Tarihi Uyarıları
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Müşteriye taahhüt edilen hedef sevk tarihi yaklaştığında veya geçtiğinde uyarı verir.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentIcon color="info" />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        DMO Muayene Uyarıları
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      DMO muayene randevu tarihi yaklaştığında veya geçtiğinde uyarı verir.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                      <strong>Önemli:</strong> Kritik uyarılar kırmızı, normal uyarılar sarı renkte gösterilir. 
                      Uyarılar manuel olarak kapatılabilir veya ilgili süreç tamamlandığında otomatik olarak çözülür.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Uyarı Türleri */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Uyarı Türleri ve Ayarları ({warningSettings.length} adet)
            </Typography>
            
            {warningSettings.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Uyarı ayarları yüklenemiyor. Lütfen sayfayı yenileyin.
              </Alert>
            )}
            
            {warningSettings.map((setting, index) => (
              <Accordion 
                key={setting.id} 
                sx={{ 
                  mb: 2, 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  '&:before': { display: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    borderRadius: '12px',
                    bgcolor: setting.isActive ? '#f8f9fa' : '#f5f5f5'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {setting.type === 'production_return' && <FactoryIcon color={setting.isActive ? 'warning' : 'disabled'} />}
                      {setting.type === 'target_shipment' && <ShippingIcon color={setting.isActive ? 'error' : 'disabled'} />}
                      {setting.type === 'dmo_inspection' && <AssignmentIcon color={setting.isActive ? 'info' : 'disabled'} />}
                      {!['production_return', 'target_shipment', 'dmo_inspection'].includes(setting.type) && 
                        <WarningIcon color={setting.isActive ? 'warning' : 'disabled'} />}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {setting.name}
                          </Typography>
                          <Chip 
                            label={
                              setting.type === 'production_return' ? 'Üretim Süreci' :
                              setting.type === 'target_shipment' ? 'Sevk Tarihi' :
                              setting.type === 'dmo_inspection' ? 'DMO Muayene' : 
                              'Genel'
                            }
                            size="small"
                            color={
                              setting.type === 'production_return' ? 'warning' :
                              setting.type === 'target_shipment' ? 'error' :
                              setting.type === 'dmo_inspection' ? 'info' : 
                              'default'
                            }
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {setting.isActive ? 
                            `Aktif - ${setting.threshold} ${setting.unit === 'hours' ? 'saat' : 'gün'} eşiği` : 
                            'Devre dışı'
                          }
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={setting.isActive}
                      onChange={(e) => {
                        const newSettings = [...warningSettings];
                        newSettings[index] = { ...newSettings[index], isActive: e.target.checked };
                        setWarningSettings(newSettings);
                      }}
                      color={
                        setting.type === 'production_return' ? 'warning' :
                        setting.type === 'target_shipment' ? 'error' :
                        setting.type === 'dmo_inspection' ? 'info' : 
                        'warning'
                      }
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ pt: 0 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Eşik Değeri"
                        type="number"
                        value={setting.threshold}
                        onChange={(e) => {
                          const newSettings = [...warningSettings];
                          newSettings[index] = { ...newSettings[index], threshold: parseInt(e.target.value) || 0 };
                          setWarningSettings(newSettings);
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">⚠️</InputAdornment>,
                        }}
                        helperText="Bu değeri aştığında uyarı oluşturulur"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Zaman Birimi</InputLabel>
                        <Select
                          value={setting.unit}
                          label="Zaman Birimi"
                          onChange={(e) => {
                            const newSettings = [...warningSettings];
                            newSettings[index] = { ...newSettings[index], unit: e.target.value as any };
                            setWarningSettings(newSettings);
                          }}
                        >
                          <MenuItem value="hours">Saat</MenuItem>
                          <MenuItem value="days">Gün</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Uyarı Seviyesi</InputLabel>
                        <Select
                          value={setting.level}
                          label="Uyarı Seviyesi"
                          onChange={(e) => {
                            const newSettings = [...warningSettings];
                            newSettings[index] = { ...newSettings[index], level: e.target.value as any };
                            setWarningSettings(newSettings);
                          }}
                        >
                          <MenuItem value="warning">⚠️ Normal Uyarı</MenuItem>
                          <MenuItem value="critical">🚨 Kritik Uyarı</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Uyarı Açıklaması"
                        multiline
                        rows={2}
                        value={setting.description || ''}
                        onChange={(e) => {
                          const newSettings = [...warningSettings];
                          newSettings[index] = { ...newSettings[index], description: e.target.value };
                          setWarningSettings(newSettings);
                        }}
                        placeholder={
                          setting.type === 'production_return' ? 
                            'Örnek: Araç kaliteden üretime gönderildikten sonra belirlenen süre içinde kaliteye dönmezse uyarı verir' :
                          setting.type === 'target_shipment' ?
                            'Örnek: Müşteriye taahhüt edilen sevk tarihi yaklaştığında veya geçtiğinde uyarı verir' :
                          setting.type === 'dmo_inspection' ?
                            'Örnek: DMO muayene randevu tarihi yaklaştığında veya geçtiğinde uyarı verir' :
                            'Bu uyarının ne zaman ve neden oluşturulduğunu açıklayın...'
                        }
                        helperText={`${
                          setting.type === 'production_return' ? 'Üretim Geri Dönüş' :
                          setting.type === 'target_shipment' ? 'Hedef Sevk Tarihi' :
                          setting.type === 'dmo_inspection' ? 'DMO Muayene Tarihi' : 
                          'Genel'
                        } uyarısı için açıklama`}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
          
          {/* Uyarı İstatistikleri */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #fff3e0', bgcolor: '#fffbf0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Uyarı İstatistikleri
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                        {warnings.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Aktif Uyarılar
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {warnings.filter(w => w.level === 'critical').length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Kritik Uyarılar
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {warningSettings.filter(w => w.isActive).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Aktif Kurallar
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {dashboardStats?.overdueVehicles || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Geciken Araçlar
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={() => setWarningSettingsDialogOpen(false)}
          variant="outlined"
          startIcon={<CloseIcon />}
        >
          İptal
        </Button>
        <Button
          onClick={handleWarningSettingsUpdate}
          variant="contained"
          color="warning"
          startIcon={<SaveIcon />}
        >
          Ayarları Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Araç detay modalı - Modern tasarım
  const renderVehicleDetailDialog = () => (
    <Dialog
      open={vehicleDetailDialogOpen}
      onClose={() => setVehicleDetailDialogOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
        color: 'white',
        py: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DirectionsCarIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {selectedVehicle?.vehicleName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Detaylı Araç Bilgileri
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Araç Temel Bilgileri */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Araç Bilgileri
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Araç Adı:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.vehicleName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Model:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.vehicleModel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Seri No:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.serialNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Müşteri:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.customerName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">SPS No:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.spsNumber || 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Üretim Tarihi:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.productionDate ? format(new Date(selectedVehicle.productionDate), 'dd.MM.yyyy') : 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">Öncelik:</Typography>
                    <Chip 
                      size="small"
                      label={selectedVehicle ? getPriorityLabel(selectedVehicle.priority) : ''}
                      sx={{ 
                        backgroundColor: selectedVehicle ? getPriorityColor(selectedVehicle.priority) : '#9e9e9e',
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">Durum:</Typography>
                    <Chip 
                      size="small"
                      label={selectedVehicle ? getStatusText(selectedVehicle.currentStatus) : ''}
                      sx={{ 
                        backgroundColor: selectedVehicle ? getVehicleStatusColor(selectedVehicle.currentStatus) : '#9e9e9e',
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarih Bilgileri */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Tarih Bilgileri
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Kalite Başlangıç:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.qualityStartDate ? 
                        format(new Date(selectedVehicle.qualityStartDate), 'dd.MM.yyyy HH:mm') : 
                        'Henüz başlamadı'
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Üretim Dönüş:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.productionReturnDate ? 
                        format(new Date(selectedVehicle.productionReturnDate), 'dd.MM.yyyy HH:mm') : 
                        'Dönüş yok'
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Sevk Tarihi:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {(() => {
                        const shippedDate = selectedVehicle ? getShippedDate(selectedVehicle) : null;
                        return shippedDate ? format(shippedDate, 'dd.MM.yyyy HH:mm') : 'Henüz sevk edilmedi';
                      })()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Hedef Sevk Tarihi:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.targetShipmentDate ? 
                        format(new Date(selectedVehicle.targetShipmentDate), 'dd.MM.yyyy') : 
                        'Belirtilmemiş'
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">DMO Muayene Tarihi:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedVehicle?.dmoDate ? 
                        format(new Date(selectedVehicle.dmoDate), 'dd.MM.yyyy') : 
                        'Belirtilmemiş'
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">Gecikme Durumu:</Typography>
                    <Chip 
                      size="small"
                      label={selectedVehicle?.isOverdue ? 'Gecikme Var' : 'Normal'}
                      color={selectedVehicle?.isOverdue ? 'error' : 'success'}
                      variant={selectedVehicle?.isOverdue ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Durum Geçmişi */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', height: '400px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Durum Geçmişi
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {selectedVehicle?.statusHistory && selectedVehicle.statusHistory.length > 0 ? (
                    <List dense>
                      {selectedVehicle.statusHistory.map((history, index) => (
                        <ListItem key={index} sx={{ 
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px',
                          mb: 1,
                          bgcolor: 'grey.50'
                        }}>
                          <ListItemIcon>
                            <Chip 
                              size="small"
                              label={getStatusText(history.status)}
                              sx={{ 
                                backgroundColor: getVehicleStatusColor(history.status),
                                color: 'white',
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="caption" color="textSecondary">
                                {history.date ? format(new Date(history.date), 'dd.MM.yyyy HH:mm') : 'Tarih bilgisi yok'}
                              </Typography>
                            }
                            secondary={
                              history.notes && (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                  {history.notes}
                                </Typography>
                              )
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                      Durum geçmişi bulunmamaktadır.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Eksiklikler */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', height: '400px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <WarningIcon color="error" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Eksiklikler
                  </Typography>
                  <Chip 
                    size="small" 
                    label={selectedVehicle?.defects?.length || 0}
                    color="error"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {selectedVehicle?.defects && selectedVehicle.defects.length > 0 ? (
                    <List dense>
                      {selectedVehicle.defects.map((defect) => (
                        <ListItem key={defect._id} sx={{ 
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px',
                          mb: 1,
                          bgcolor: 'grey.50',
                          flexDirection: 'column',
                          alignItems: 'stretch'
                        }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {defect.category} - {defect.subcategory}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={getPriorityLabel(defect.priority)}
                                  sx={{ 
                                    backgroundColor: getPriorityColor(defect.priority),
                                    color: 'white',
                                    fontWeight: 'medium'
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {defect.description}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Rapor: {defect.reportedDate ? format(new Date(defect.reportedDate), 'dd.MM.yyyy HH:mm') : 'Tarih bilgisi yok'} | 
                                  Durum: {getDefectStatusLabel(defect.status)}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            mt: 1, 
                            pt: 1, 
                            borderTop: '1px solid #e0e0e0' 
                          }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<AssignmentIcon />}
                              onClick={() => handleCreateDOF(defect, selectedVehicle)}
                              sx={{
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                px: 1.5,
                                py: 0.5
                              }}
                            >
                              DÖF Oluştur
                            </Button>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                      Eksiklik bulunmamaktadır.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={() => setVehicleDetailDialogOpen(false)}
          variant="outlined"
          startIcon={<CloseIcon />}
        >
          Kapat
        </Button>
        {selectedVehicle && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadVehicles();
              setSuccess('Veriler yenilendi');
            }}
          >
            Yenile
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  // Araç düzenleme fonksiyonu
  const handleVehicleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      vehicleName: vehicle.vehicleName,
      vehicleModel: vehicle.vehicleModel,
      serialNumber: vehicle.serialNumber,
      customerName: vehicle.customerName,
      spsNumber: vehicle.spsNumber || '',
      productionDate: vehicle.productionDate,
      targetShipmentDate: vehicle.targetShipmentDate,
      dmoDate: vehicle.dmoDate,
      description: vehicle.description || '',
      priority: vehicle.priority
    });
    setVehicleEditDialogOpen(true);
  };
  
  // Araç güncelleme fonksiyonu
  const handleVehicleUpdate = async () => {
    if (!editingVehicle) return;
    
    try {
      setLoading(true);
      
      // Form verilerini güncelle
      const updateData = {
        ...vehicleForm,
        currentStatus: editingVehicle.currentStatus,
        statusHistory: editingVehicle.statusHistory,
        updatedAt: new Date()
      };
      
      await vehicleQualityControlService.updateVehicle(editingVehicle._id, updateData);
      await loadVehicles();
      setVehicleEditDialogOpen(false);
      setEditingVehicle(null);
      resetVehicleForm();
      setSuccess('Araç başarıyla güncellendi');
    } catch (error) {
      setError('Araç güncellenirken hata oluştu');
      console.error('Araç güncelleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Araç silme fonksiyonu
  const handleVehicleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`${vehicle.vehicleName} (${vehicle.serialNumber}) aracını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return;
    }
    
    try {
      setLoading(true);
      await vehicleQualityControlService.deleteVehicle(vehicle._id);
      await loadVehicles();
      setSuccess('Araç başarıyla silindi');
    } catch (error) {
      setError('Araç silinirken hata oluştu');
      console.error('Araç silme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eksiklik raporlama için araç seçimi
  const handleDefectReportForVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForDefect(vehicle);
    setDefectDialogOpen(true);
  };

  // Ana render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error/Success Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Ana içerik */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="vehicle quality control tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<DirectionsCarIcon />} label="Araçlar" />
          <Tab icon={<QualityControlIcon />} label="Kalite Kontrol" />
          <Tab icon={<FactoryIcon />} label="Üretim" />
          <Tab icon={<ShippingIcon />} label="Sevk" />
          <Tab icon={<WarningIcon />} label="Uyarılar" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {renderDashboard()}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderVehicleList()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {renderQualityControl()}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {renderProductionManagement()}
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {renderShipmentManagement()}
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {renderWarnings()}
        </TabPanel>
      </Paper>

      {/* Hızlı işlem menüsü - düzeltilmiş */}
      <SpeedDial
        ariaLabel="Hızlı İşlemler"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Yeni Araç Ekle"
          onClick={() => {
            setSpeedDialOpen(false);
            resetVehicleForm();
            setVehicleDialogOpen(true);
          }}
        />
        <SpeedDialAction
          icon={<RefreshIcon />}
          tooltipTitle="Verileri Yenile"
          onClick={() => {
            setSpeedDialOpen(false);
            loadDashboardData();
            loadVehicles();
          }}
        />
        <SpeedDialAction
          icon={<SettingsIcon />}
          tooltipTitle="Uyarı Ayarları"
          onClick={() => {
            setSpeedDialOpen(false);
            setWarningSettingsDialogOpen(true);
          }}
        />
      </SpeedDial>

      {/* Dialoglar */}
      {renderVehicleDialog()}
      {renderDefectDialog()}
      {renderWarningSettingsDialog()}
      {renderVehicleDetailDialog()}
      {renderVehicleEditDialog()}
    </Container>
  );
};

export default VehicleQualityControl; 