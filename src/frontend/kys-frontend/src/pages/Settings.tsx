import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  IconButton,
  Avatar,
  Switch,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  LibraryBooks as LibraryBooksIcon,
  IntegrationInstructions as IntegrationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Backup as BackupIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Api as ApiIcon,
  ExpandMore as ExpandMoreIcon,
  AdminPanelSettings as AdminIcon,
  VpnKey as VpnKeyIcon,
  Visibility as VisibilityIcon,
  AccountTree as AccountTreeIcon,
  DateRange as DateRangeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentTurnedIn as QualityIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';

// Styled Components
const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: theme.palette.background.default,
  maxWidth: '1400px',
  margin: '0 auto',
  width: '100%',
  overflow: 'hidden',
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  width: '100%',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out',
  },
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  overflow: 'auto',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&::before': {
    content: '""',
    width: '4px',
    height: '20px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

// Types
interface ModulePermission {
  moduleId: string;
  moduleName: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  active: boolean;
  lastLogin: string;
  permissions: string[];
  modulePermissions: ModulePermission[];
  phone?: string;
  position?: string;
}

interface Department {
  id: string;
  name: string;
  manager: string;
  parentId?: string;
  employeeCount: number;
  description?: string;
}

interface NotificationSetting {
  id: string;
  name: string;
  email: boolean;
  app: boolean;
  sms: boolean;
  description: string;
  category: 'system' | 'quality' | 'maintenance' | 'security';
}

interface Standard {
  id: string;
  code: string;
  name: string;
  version: string;
  category: 'quality' | 'testing' | 'safety' | 'security';
  active: boolean;
  lastUpdated: string;
  description: string;
}



// Kalite yönetim sistemi modülleri
const systemModules = [
  { id: 'dashboard', name: 'Ana Panel' },
  { id: 'quality_control', name: 'Kalite Kontrol' },
  { id: 'process_management', name: 'Süreç Yönetimi' },
  { id: 'document_management', name: 'Doküman Yönetimi' },
  { id: 'audit_management', name: 'Denetim Yönetimi' },
  { id: 'corrective_actions', name: 'Düzeltici Faaliyetler' },
  { id: 'kpi_management', name: 'KPI Yönetimi' },
  { id: 'training_management', name: 'Eğitim Yönetimi' },
  { id: 'supplier_management', name: 'Tedarikçi Yönetimi' },
  { id: 'customer_feedback', name: 'Müşteri Geri Bildirimi' },
  { id: 'risk_management', name: 'Risk Yönetimi' },
  { id: 'settings', name: 'Sistem Ayarları' }
];

const getDefaultModulePermissions = (role: string): ModulePermission[] => {
  return systemModules.map(module => {
    if (role === 'Sistem Yöneticisi') {
      return {
        moduleId: module.id,
        moduleName: module.name,
        canView: true,
        canEdit: true,
        canDelete: true
      };
    } else if (role === 'Kalite Uzmanı') {
      return {
        moduleId: module.id,
        moduleName: module.name,
        canView: ['settings', 'user_management'].includes(module.id) ? false : true,
        canEdit: ['quality_control', 'process_management', 'document_management', 'corrective_actions'].includes(module.id),
        canDelete: ['quality_control', 'corrective_actions'].includes(module.id)
      };
    } else if (role === 'Süreç Uzmanı') {
      return {
        moduleId: module.id,
        moduleName: module.name,
        canView: ['settings', 'user_management', 'supplier_management'].includes(module.id) ? false : true,
        canEdit: ['process_management', 'kpi_management', 'corrective_actions'].includes(module.id),
        canDelete: false
      };
    } else { // Görüntüleyici
      return {
        moduleId: module.id,
        moduleName: module.name,
        canView: !['settings', 'user_management'].includes(module.id),
        canEdit: false,
        canDelete: false
      };
    }
  });
};

// Kalite yönetim sistemi kullanıcıları
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@kademe.com',
    role: 'Sistem Yöneticisi',
    department: 'Kalite Güvence',
    active: true,
    lastLogin: '2 saat önce',
    permissions: ['user_management', 'settings', 'all_modules'],
    modulePermissions: getDefaultModulePermissions('Sistem Yöneticisi'),
    phone: '+90 555 123 4567',
    position: 'Kalite Müdürü'
  },
  {
    id: '2',
    name: 'Ayşe Kaya',
    email: 'ayse.kaya@kademe.com',
    role: 'Kalite Uzmanı',
    department: 'Kalite Kontrol',
    active: true,
    lastLogin: '1 gün önce',
    permissions: ['quality_control', 'process_analysis', 'reports'],
    modulePermissions: getDefaultModulePermissions('Kalite Uzmanı'),
    phone: '+90 555 987 6543',
    position: 'Kıdemli Kalite Mühendisi'
  },
  {
    id: '3',
    name: 'Mehmet Demir',
    email: 'mehmet.demir@kademe.com',
    role: 'Süreç Uzmanı',
    department: 'Süreç Geliştirme',
    active: true,
    lastLogin: '3 saat önce',
    permissions: ['process_analysis', 'improvement', 'reports'],
    modulePermissions: getDefaultModulePermissions('Süreç Uzmanı'),
    phone: '+90 555 456 7890',
    position: 'Süreç Geliştirme Uzmanı'
  },
  {
    id: '4',
    name: 'Fatma Öz',
    email: 'fatma.oz@kademe.com',
    role: 'Görüntüleyici',
    department: 'Ar-Ge',
    active: false,
    lastLogin: '1 hafta önce',
    permissions: ['reports'],
    modulePermissions: getDefaultModulePermissions('Görüntüleyici'),
    phone: '+90 555 321 0987',
    position: 'Ar-Ge Mühendisi'
  }
];

const mockDepartments: Department[] = [
  { 
    id: '1', 
    name: 'Kalite Güvence', 
    manager: 'Ahmet Yılmaz', 
    employeeCount: 8,
    description: 'Genel kalite güvence ve ISO standartları yönetimi'
  },
  { 
    id: '2', 
    name: 'Kalite Kontrol', 
    manager: 'Ayşe Kaya', 
    employeeCount: 15,
    description: 'Ürün ve süreç kalite kontrol faaliyetleri'
  },
  { 
    id: '3', 
    name: 'Süreç Geliştirme', 
    manager: 'Mehmet Demir', 
    employeeCount: 12,
    description: 'Süreç iyileştirme ve optimizasyon çalışmaları'
  },
  { 
    id: '4', 
    name: 'Üretim', 
    manager: 'Ali Şen', 
    employeeCount: 25,
    description: 'Üretim süreçleri ve operasyon yönetimi'
  },
  { 
    id: '5', 
    name: 'Ar-Ge', 
    manager: 'Fatma Öz', 
    employeeCount: 6,
    description: 'Yeni teknolojiler ve ürün geliştirme'
  }
];

const notificationSettings: NotificationSetting[] = [
  {
    id: '1',
    name: 'Kalite Analiz Sonuçları',
    email: true,
    app: true,
    sms: false,
    description: 'Kalite analizi tamamlandığında bildirim al',
    category: 'quality'
  },
  {
    id: '2',
    name: 'Süreç Onay Bildirimleri',
    email: true,
    app: true,
    sms: true,
    description: 'Yeni süreç prosedürü onay beklerken bildirim al',
    category: 'quality'
  },
  {
    id: '3',
    name: 'Bütçe Aşım Uyarıları',
    email: false,
    app: true,
    sms: false,
    description: 'Departman bütçesi aşıldığında uyar',
    category: 'system'
  },
  {
    id: '4',
    name: 'Sistem Bakımı',
    email: true,
    app: true,
    sms: false,
    description: 'Sistem bakım ve güncelleme bildirimleri',
    category: 'maintenance'
  },
  {
    id: '5',
    name: 'Güvenlik Uyarıları',
    email: true,
    app: true,
    sms: true,
    description: 'Güvenlik ihlalleri ve sistem uyarıları',
    category: 'security'
  },
  {
    id: '6',
    name: 'Doküman Güncellemeleri',
    email: true,
    app: true,
    sms: false,
    description: 'Kalite dokümanları güncellendiğinde bildir',
    category: 'quality'
  }
];

const qualityStandards: Standard[] = [
  {
    id: '1',
    code: 'ISO 9001',
    name: 'Kalite Yönetim Sistemi',
    version: '2015',
    category: 'quality',
    active: true,
    lastUpdated: '2024-01-15',
    description: 'Kalite yönetim sistem gereksinimleri ve sürekli iyileştirme'
  },
  {
    id: '2',
    code: 'ISO 14001',
    name: 'Çevre Yönetim Sistemi',
    version: '2015',
    category: 'quality',
    active: true,
    lastUpdated: '2024-02-20',
    description: 'Çevresel etki yönetimi ve sürdürülebilirlik'
  },
  {
    id: '3',
    code: 'ISO 45001',
    name: 'İş Sağlığı ve Güvenliği',
    version: '2018',
    category: 'safety',
    active: true,
    lastUpdated: '2024-03-10',
    description: 'İş sağlığı ve güvenliği yönetim sistemi'
  },
  {
    id: '4',
    code: 'ISO 27001',
    name: 'Bilgi Güvenliği Yönetimi',
    version: '2022',
    category: 'security',
    active: true,
    lastUpdated: '2024-01-05',
    description: 'Bilgi güvenliği yönetim sistemi gereksinimleri'
  },
  {
    id: '5',
    code: 'TS EN ISO 19011',
    name: 'Yönetim Sistemi Denetimleri',
    version: '2018',
    category: 'testing',
    active: true,
    lastUpdated: '2024-04-01',
    description: 'Yönetim sistemi denetim rehberi ve kriterleri'
  },
  {
    id: '6',
    code: 'ISO 13485',
    name: 'Tıbbi Cihazlar Kalite Sistemi',
    version: '2016',
    category: 'quality',
    active: false,
    lastUpdated: '2024-02-15',
    description: 'Tıbbi cihazlar için kalite yönetim sistemi'
  }
];

const TabContent = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <TabPanel>{children}</TabPanel>}
  </div>
);

const Settings: React.FC = () => {
  const { appearanceSettings, updateAppearanceSettings } = useThemeContext();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [standardDialogOpen, setStandardDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  
  // Data states
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [notifications, setNotifications] = useState<NotificationSetting[]>(notificationSettings);
  const [standards, setStandards] = useState<Standard[]>(qualityStandards);
  const [showPassword] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    position: '',
    active: true
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    manager: '',
    description: ''
  });

  const [standardForm, setStandardForm] = useState({
    code: '',
    name: '',
    version: '',
    category: 'quality' as 'quality' | 'testing' | 'safety' | 'security',
    description: '',
    active: true
  });

  // Settings states
  const [systemSettings, setSystemSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
      historyCount: 5
    },
    sessionTimeout: 30,
    autoLogout: true,
    enableTwoFactor: false,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maxLoginAttempts: 3,
    lockoutDuration: 15
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    erpConnection: false,
    mesConnection: false,
    crmConnection: false,
    apiKey: '',
    webhookUrl: '',
    syncFrequency: 'hourly',
    apiTimeout: 30,
    retryAttempts: 3
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.kademe.com',
    port: 587,
    username: 'notifications@kademe.com',
    password: '',
    enableTLS: true,
    senderName: 'Kademe A.Ş. KYS'
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('settings_users');
      const savedDepartments = localStorage.getItem('settings_departments');
      const savedNotifications = localStorage.getItem('settings_notifications');
      const savedStandards = localStorage.getItem('settings_standards');
      const savedSystemSettings = localStorage.getItem('settings_systemSettings');
      const savedIntegrationSettings = localStorage.getItem('settings_integrationSettings');
      const savedEmailSettings = localStorage.getItem('settings_emailSettings');

      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
      if (savedDepartments) {
        setDepartments(JSON.parse(savedDepartments));
      }
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedStandards) {
        setStandards(JSON.parse(savedStandards));
      }
      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings));
      }
      if (savedIntegrationSettings) {
        setIntegrationSettings(JSON.parse(savedIntegrationSettings));
      }
      if (savedEmailSettings) {
        setEmailSettings(JSON.parse(savedEmailSettings));
      }
    } catch (error) {
      console.error('Settings verilerini yükleme hatası:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('settings_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('settings_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('settings_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('settings_standards', JSON.stringify(standards));
  }, [standards]);

  useEffect(() => {
    localStorage.setItem('settings_systemSettings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('settings_integrationSettings', JSON.stringify(integrationSettings));
  }, [integrationSettings]);

  useEffect(() => {
    localStorage.setItem('settings_emailSettings', JSON.stringify(emailSettings));
  }, [emailSettings]);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // User management functions
  const handleUserAction = (action: string, user?: User) => {
    if (action === 'add') {
      setSelectedUser(null);
      setUserForm({
        name: '',
        email: '',
        role: 'Görüntüleyici',
        department: departments[0]?.name || '',
        phone: '',
        position: '',
        active: true
      });
    } else if (action === 'edit' && user) {
      setSelectedUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone || '',
        position: user.position || '',
        active: user.active
      });
    }
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (selectedUser) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                ...userForm,
                permissions: getRolePermissions(userForm.role),
                modulePermissions: user.role !== userForm.role ? getDefaultModulePermissions(userForm.role) : user.modulePermissions
              } 
            : user
        ));
        showNotification('Kullanıcı başarıyla güncellendi!');
      } else {
        // Add new user
        const newUser: User = {
          id: Date.now().toString(),
          ...userForm,
          lastLogin: 'Hiç',
          permissions: getRolePermissions(userForm.role),
          modulePermissions: getDefaultModulePermissions(userForm.role)
        };
        setUsers([...users, newUser]);
        showNotification('Yeni kullanıcı başarıyla eklendi!');
      }
      
      setUserDialogOpen(false);
      setSelectedUser(null);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      setUsers(users.filter(user => user.id !== userId));
      showNotification('Kullanıcı başarıyla silindi!', 'warning');
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, active: !user.active } : user
    ));
    const user = users.find(u => u.id === userId);
    showNotification(`${user?.name} ${user?.active ? 'pasif' : 'aktif'} hale getirildi!`);
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'Sistem Yöneticisi':
        return ['user_management', 'settings', 'all_modules', 'backup_restore', 'system_config'];
      case 'Kalite Uzmanı':
        return ['quality_control', 'process_analysis', 'improvement', 'reports', 'standards'];
      case 'Süreç Uzmanı':
        return ['process_analysis', 'improvement', 'reports', 'standards'];
      case 'Görüntüleyici':
        return ['reports'];
      default:
        return ['reports'];
    }
  };

  // Module permissions management
  const handleViewPermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionDialogOpen(true);
  };

  const handleUpdateModulePermission = (moduleId: string, permissionType: 'canView' | 'canEdit' | 'canDelete', value: boolean) => {
    if (selectedUser) {
      const updatedPermissions = selectedUser.modulePermissions.map(mp =>
        mp.moduleId === moduleId ? { ...mp, [permissionType]: value } : mp
      );
      
      const updatedUser = { ...selectedUser, modulePermissions: updatedPermissions };
      setSelectedUser(updatedUser);
      
      setUsers(users.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));
    }
  };

  // Department management functions
  const handleDepartmentAction = (action: string, department?: Department) => {
    if (action === 'add') {
      setSelectedDepartment(null);
      setDepartmentForm({
        name: '',
        manager: '',
        description: ''
      });
    } else if (action === 'edit' && department) {
      setSelectedDepartment(department);
      setDepartmentForm({
        name: department.name,
        manager: department.manager,
        description: department.description || ''
      });
    }
    setDepartmentDialogOpen(true);
  };

  const handleSaveDepartment = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (selectedDepartment) {
        setDepartments(departments.map(dept => 
          dept.id === selectedDepartment.id 
            ? { ...dept, ...departmentForm }
            : dept
        ));
        showNotification('Departman başarıyla güncellendi!');
      } else {
        const newDepartment: Department = {
          id: Date.now().toString(),
          ...departmentForm,
          employeeCount: 0
        };
        setDepartments([...departments, newDepartment]);
        showNotification('Yeni departman başarıyla eklendi!');
      }
      
      setDepartmentDialogOpen(false);
      setSelectedDepartment(null);
      setLoading(false);
    }, 1000);
  };

  // Notification functions
  const handleNotificationChange = (notificationId: string, type: 'email' | 'app' | 'sms', value: boolean) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, [type]: value }
        : notification
    ));
  };

  // Appearance functions
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    updateAppearanceSettings({ theme: newTheme });
    showNotification(`${newTheme === 'dark' ? 'Koyu' : 'Açık'} tema uygulandı!`);
  };

  const handlePrimaryColorChange = (color: string) => {
    updateAppearanceSettings({ primaryColor: color });
    showNotification('Ana renk güncellendi!');
  };

  const handleLanguageChange = (language: string) => {
    updateAppearanceSettings({ language });
    showNotification('Dil ayarı güncellendi!');
  };

  const handleDateFormatChange = (dateFormat: string) => {
    updateAppearanceSettings({ dateFormat });
    showNotification('Tarih formatı güncellendi!');
  };

  const handleTimeFormatChange = (timeFormat: string) => {
    updateAppearanceSettings({ timeFormat });
    showNotification('Saat formatı güncellendi!');
  };

  const handleCurrencyChange = (currency: string) => {
    updateAppearanceSettings({ currency });
    showNotification('Para birimi güncellendi!');
  };

  const handleDashboardLayoutChange = (dashboardLayout: string) => {
    updateAppearanceSettings({ dashboardLayout });
    showNotification('Dashboard düzeni güncellendi!');
  };

  // Standard management functions
  // Standards management functions
  const handleStandardAction = (action: string, standard?: Standard) => {
    if (action === 'add') {
      setSelectedStandard(null);
      setStandardForm({
        code: '',
        name: '',
        version: '',
        category: 'quality',
        description: '',
        active: true
      });
    } else if (action === 'edit' && standard) {
      setSelectedStandard(standard);
      setStandardForm({
        code: standard.code,
        name: standard.name,
        version: standard.version,
        category: standard.category,
        description: standard.description,
        active: standard.active
      });
    }
    setStandardDialogOpen(true);
  };

  const handleSaveStandard = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (selectedStandard) {
        setStandards(standards.map(standard => 
          standard.id === selectedStandard.id 
            ? { 
                ...standard, 
                ...standardForm,
                lastUpdated: new Date().toISOString().split('T')[0]
              } 
            : standard
        ));
        showNotification('Standart başarıyla güncellendi!');
      } else {
        const newStandard: Standard = {
          id: Date.now().toString(),
          ...standardForm,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        setStandards([...standards, newStandard]);
        showNotification('Yeni standart başarıyla eklendi!');
      }
      
      setStandardDialogOpen(false);
      setSelectedStandard(null);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteStandard = (standardId: string) => {
    if (window.confirm('Bu standardı silmek istediğinizden emin misiniz?')) {
      setStandards(standards.filter(standard => standard.id !== standardId));
      showNotification('Standart başarıyla silindi!', 'warning');
    }
  };

  const handleStandardToggle = (standardId: string) => {
    setStandards(standards.map(standard =>
      standard.id === standardId 
        ? { ...standard, active: !standard.active }
        : standard
    ));
    const standard = standards.find(s => s.id === standardId);
    showNotification(`${standard?.code} standardı ${standard?.active ? 'devre dışı' : 'aktif'} bırakıldı!`);
  };

  // System functions
  const handleSaveSettings = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Simulate saving to backend
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      localStorage.setItem('integrationSettings', JSON.stringify(integrationSettings));
      localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      setLoading(false);
      showNotification('Tüm ayarlar başarıyla kaydedildi!');
    }, 1500);
  };



  const handleTestEmailConnection = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Simulate email test
      if (emailSettings.smtpServer && emailSettings.username) {
        showNotification('E-posta bağlantısı başarılı!');
      } else {
        showNotification('E-posta ayarları eksik!', 'error');
      }
      setLoading(false);
    }, 2000);
  };



  const getNotificationColor = (category: string) => {
    switch (category) {
      case 'system': return 'info';
      case 'quality': return 'success';
      case 'maintenance': return 'warning';
      case 'security': return 'error';
      default: return 'default';
    }
  };

  const getStandardColor = (category: string) => {
    switch (category) {
      case 'welding': return 'primary';
      case 'quality': return 'success';
      case 'testing': return 'warning';
      case 'safety': return 'error';
      default: return 'default';
    }
  };

  return (
    <MainContainer>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Main Settings Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab icon={<PersonIcon />} label="Kullanıcı Yönetimi" />
          <Tab icon={<BusinessIcon />} label="Birim Yönetimi" />
          <Tab icon={<SecurityIcon />} label="Güvenlik" />
          <Tab icon={<PaletteIcon />} label="Görünüm" />
                        <Tab icon={<NotificationsIcon />} label="Bildirimler" />
          <Tab icon={<LibraryBooksIcon />} label="Kalite Standartları" />
          <Tab icon={<IntegrationIcon />} label="Entegrasyonlar" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      
      {/* 1. Kullanıcı ve Yetki Yönetimi */}
      <TabContent value={activeTab} index={0}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ 
            flex: { xs: '1 1 100%', lg: '1 1 65%' }, 
            minWidth: 0,
            '& .MuiTableContainer-root': {
              maxWidth: '100%'
            }
          }}>
            <SettingsCard>
              <CardHeader 
                title="Kalite Yönetim Sistemi Personeli"
                action={
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleUserAction('add')}
                  >
                    Yeni Kullanıcı Ekle
                  </Button>
                }
              />
              <CardContent>
                <TableContainer sx={{ 
                  overflowX: 'auto', 
                  width: '100%',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 4,
                  }
                }}>
                  <Table sx={{ 
                    minWidth: 1020, 
                    tableLayout: 'fixed',
                    '& .MuiTableCell-root': {
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }
                  }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 220, fontWeight: 600 }}>Kullanıcı</TableCell>
                        <TableCell sx={{ width: 160, fontWeight: 600 }}>Rol & Departman</TableCell>
                        <TableCell sx={{ width: 200, fontWeight: 600 }}>İletişim</TableCell>
                        <TableCell sx={{ width: 120, textAlign: 'center', fontWeight: 600 }}>Durum</TableCell>
                        <TableCell sx={{ width: 140, fontWeight: 600 }}>Son Giriş</TableCell>
                        <TableCell sx={{ width: 180, textAlign: 'center', fontWeight: 600 }}>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {user.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.position || 'Pozisyon belirtilmemiş'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                                                  <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip 
                              label={user.role}
                              color={
                                user.role === 'Sistem Yöneticisi' ? 'error' : 
                                user.role === 'Kalite Uzmanı' ? 'primary' :
                                user.role === 'Süreç Uzmanı' ? 'success' : 'default'
                              }
                              size="small"
                              sx={{ fontSize: '0.75rem', height: 'auto', minHeight: 24 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {user.department}
                            </Typography>
                          </Box>
                        </TableCell>
                                                  <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', wordBreak: 'break-word' }}>
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {user.phone || 'Telefon yok'}
                            </Typography>
                          </Box>
                        </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Switch 
                                checked={user.active}
                                onChange={() => handleToggleUserStatus(user.id)}
                                size="small"
                              />
                              <Typography variant="caption" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                {user.active ? 'Aktif' : 'Pasif'}
                              </Typography>
                            </Box>
                          </TableCell>
                                                  <TableCell>
                          <Typography variant="caption" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {user.lastLogin}
                          </Typography>
                        </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="Yetkileri Görüntüle">
                                <IconButton 
                                  size="small" 
                                  color="info"
                                  onClick={() => handleViewPermissions(user)}
                                >
                                  <VpnKeyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Düzenle">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleUserAction('edit', user)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 32%' }, minWidth: 0 }}>
            <SettingsCard>
              <CardHeader title="Rol ve Yetki Tanımları" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AdminIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sistem Yöneticisi"
                      secondary="Tüm modüllere ve ayarlara tam erişim"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Kalite Uzmanı"
                      secondary="Kalite kontrol, süreç analizi, raporlama erişimi"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Süreç Uzmanı"
                      secondary="Süreç analizi ve iyileştirme erişimi"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VisibilityIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Görüntüleyici"
                      secondary="Sadece rapor görüntüleme yetkisi"
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Button variant="outlined" fullWidth startIcon={<AddIcon />}>
                  Özel Rol Tanımla
                </Button>
              </CardContent>
            </SettingsCard>

            <SettingsCard sx={{ mt: 2 }}>
              <CardHeader title="Sistem İstatistikleri" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Toplam Kullanıcı:</Typography>
                    <Typography variant="body2" fontWeight={600}>{users.length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Aktif Kullanıcı:</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {users.filter(u => u.active).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>
      </TabContent>

      {/* 2. Birim ve Organizasyon Yönetimi */}
      <TabContent value={activeTab} index={1}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, minWidth: 0 }}>
            <SettingsCard>
              <CardHeader 
                title="Departman Yönetimi"
                action={
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleDepartmentAction('add')}
                  >
                    Yeni Departman
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {departments.map((dept) => (
                    <ListItem key={dept.id}>
                      <ListItemIcon>
                        <AccountTreeIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {dept.name}
                            </Typography>
                            <Chip 
                              label={`${dept.employeeCount} kişi`} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Sorumlu: {dept.manager}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dept.description}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end"
                          onClick={() => handleDepartmentAction('edit', dept)}
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, minWidth: 0 }}>
            <SettingsCard>
              <CardHeader title="Organizasyon Şeması" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Kalite Yönetim Sistemi departman yapısı
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText', 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Kalite Yönetim Müdürlüğü
                    </Typography>
                  </Box>
                  
                  <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {departments.map((dept) => (
                      <Box 
                        key={dept.id}
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'background.paper', 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {dept.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dept.manager}
                          </Typography>
                        </Box>
                        <Chip 
                          label={dept.employeeCount} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                  Şema Düzenle
                </Button>
              </CardContent>
            </SettingsCard>

            <SettingsCard sx={{ mt: 2 }}>
              <CardHeader title="Departman İstatistikleri" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Toplam Departman:</Typography>
                    <Typography variant="body2" fontWeight={600}>{departments.length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Toplam Personel:</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>
      </TabContent>

      {/* 3. Sistem ve Güvenlik Ayarları */}
      <TabContent value={activeTab} index={2}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="Parola Politikası" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Minimum Parola Uzunluğu"
                    type="number"
                    value={systemSettings.passwordPolicy.minLength}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      passwordPolicy: {
                        ...systemSettings.passwordPolicy,
                        minLength: parseInt(e.target.value)
                      }
                    })}
                    size="small"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={systemSettings.passwordPolicy.requireUppercase}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          passwordPolicy: {
                            ...systemSettings.passwordPolicy,
                            requireUppercase: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Büyük harf zorunlu"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={systemSettings.passwordPolicy.requireNumbers}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          passwordPolicy: {
                            ...systemSettings.passwordPolicy,
                            requireNumbers: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Sayı zorunlu"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={systemSettings.passwordPolicy.requireSpecialChars}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          passwordPolicy: {
                            ...systemSettings.passwordPolicy,
                            requireSpecialChars: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Özel karakter zorunlu"
                  />

                  <TextField
                    label="Parola Geçerlilik Süresi (gün)"
                    type="number"
                    value={systemSettings.passwordPolicy.maxAge}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      passwordPolicy: {
                        ...systemSettings.passwordPolicy,
                        maxAge: parseInt(e.target.value)
                      }
                    })}
                    size="small"
                  />
                </Box>
              </CardContent>
            </SettingsCard>

            <SettingsCard sx={{ mt: 2 }}>
              <CardHeader title="Oturum Güvenliği" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Oturum Zaman Aşımı (dakika)"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      sessionTimeout: parseInt(e.target.value)
                    })}
                    size="small"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemSettings.autoLogout}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          autoLogout: e.target.checked
                        })}
                      />
                    }
                    label="Otomatik çıkış"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemSettings.enableTwoFactor}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          enableTwoFactor: e.target.checked
                        })}
                      />
                    }
                    label="İki faktörlü kimlik doğrulama"
                  />
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="Sistem Yedekleme" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemSettings.autoBackup}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          autoBackup: e.target.checked
                        })}
                      />
                    }
                    label="Otomatik yedekleme"
                  />

                  <FormControl size="small">
                    <InputLabel>Yedekleme Sıklığı</InputLabel>
                    <Select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        backupFrequency: e.target.value
                      })}
                    >
                      <MenuItem value="hourly">Saatlik</MenuItem>
                      <MenuItem value="daily">Günlük</MenuItem>
                      <MenuItem value="weekly">Haftalık</MenuItem>
                      <MenuItem value="monthly">Aylık</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Veri Saklama Süresi (gün)"
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      dataRetention: parseInt(e.target.value)
                    })}
                    size="small"
                  />

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="contained" startIcon={<BackupIcon />} fullWidth>
                      Manuel Yedek Al
                    </Button>
                    <Button variant="outlined" startIcon={<HistoryIcon />} fullWidth>
                      Yedek Geçmişi
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </SettingsCard>

            <SettingsCard sx={{ mt: 2 }}>
              <CardHeader title="Güvenlik Olayları" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Başarılı Giriş"
                      secondary="ahmet.yilmaz@kademe.com - 2 saat önce"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Başarısız Giriş Denemesi"
                      secondary="Bilinmeyen IP - 1 gün önce"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Parola Değişikliği"
                      secondary="ayse.kaya@kademe.com - 3 gün önce"
                    />
                  </ListItem>
                </List>
                <Button variant="outlined" fullWidth sx={{ mt: 1 }}>
                  Tüm Güvenlik Olaylarını Görüntüle
                </Button>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>
      </TabContent>

      {/* 4. Görünüm ve Kişiselleştirme */}
      <TabContent value={activeTab} index={3}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="Tema ve Renk Ayarları" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <SectionTitle>Tema Seçimi</SectionTitle>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={appearanceSettings.theme === 'dark' ? 'contained' : 'outlined'}
                        startIcon={<DarkModeIcon />}
                        onClick={() => handleThemeChange('dark')}
                      >
                        Koyu Tema
                      </Button>
                      <Button
                        variant={appearanceSettings.theme === 'light' ? 'contained' : 'outlined'}
                        startIcon={<LightModeIcon />}
                        onClick={() => handleThemeChange('light')}
                      >
                        Açık Tema
                      </Button>
                    </Box>
                  </Box>

                  <FormControl size="small">
                    <InputLabel>Ana Renk</InputLabel>
                    <Select
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    >
                      <MenuItem value="#2196f3">🔵 Mavi (Varsayılan)</MenuItem>
                      <MenuItem value="#4caf50">🟢 Yeşil</MenuItem>
                      <MenuItem value="#ff9800">🟠 Turuncu</MenuItem>
                      <MenuItem value="#9c27b0">🟣 Mor</MenuItem>
                      <MenuItem value="#f44336">🔴 Kırmızı</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Dashboard Düzeni</InputLabel>
                    <Select
                      value={appearanceSettings.dashboardLayout}
                      onChange={(e) => handleDashboardLayoutChange(e.target.value)}
                    >
                      <MenuItem value="default">Varsayılan</MenuItem>
                      <MenuItem value="compact">Kompakt</MenuItem>
                      <MenuItem value="detailed">Detaylı</MenuItem>
                      <MenuItem value="custom">Özelleştirilmiş</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="Dil ve Bölgesel Ayarlar" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size="small">
                    <InputLabel>Dil</InputLabel>
                    <Select
                      value={appearanceSettings.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
                      <MenuItem value="en">🇺🇸 English</MenuItem>
                      <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Tarih Formatı</InputLabel>
                    <Select
                      value={appearanceSettings.dateFormat}
                      onChange={(e) => handleDateFormatChange(e.target.value)}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Türkiye)</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (ABD)</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Saat Formatı</InputLabel>
                    <Select
                      value={appearanceSettings.timeFormat}
                      onChange={(e) => handleTimeFormatChange(e.target.value)}
                    >
                      <MenuItem value="24">24 Saat (14:30)</MenuItem>
                      <MenuItem value="12">12 Saat (2:30 PM)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Para Birimi</InputLabel>
                    <Select
                      value={appearanceSettings.currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                    >
                      <MenuItem value="TRY">₺ Türk Lirası</MenuItem>
                      <MenuItem value="USD">$ ABD Doları</MenuItem>
                      <MenuItem value="EUR">€ Euro</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </SettingsCard>

            <SettingsCard sx={{ mt: 2 }}>
              <CardHeader title="Şirket Logosu" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 120, 
                    height: 60, 
                    border: '2px dashed', 
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Logo Alanı
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Logo Yükle
                  </Button>
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>
      </TabContent>

      {/* 5. Bildirim ve Hatırlatıcılar */}
      <TabContent value={activeTab} index={4}>
        <SettingsCard sx={{ overflow: 'hidden' }}>
          <CardHeader title="Bildirim Tercihleri" />
          <CardContent sx={{ padding: '16px', overflow: 'auto' }}>
            <TableContainer sx={{ 
              overflowX: 'auto', 
              width: '100%',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 4,
              }
            }}>
              <Table sx={{ 
                minWidth: 900, 
                tableLayout: 'fixed',
                '& .MuiTableCell-root': {
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(224, 224, 224, 1)'
                }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 180, fontWeight: 600 }}>Bildirim Türü</TableCell>
                    <TableCell sx={{ width: 110, fontWeight: 600 }}>Kategori</TableCell>
                    <TableCell align="center" sx={{ width: 90, fontWeight: 600 }}>E-posta</TableCell>
                    <TableCell align="center" sx={{ width: 100, fontWeight: 600 }}>Uygulama</TableCell>
                    <TableCell align="center" sx={{ width: 80, fontWeight: 600 }}>SMS</TableCell>
                    <TableCell sx={{ width: 340, fontWeight: 600 }}>Açıklama</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {notification.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={notification.category}
                          color={getNotificationColor(notification.category) as any}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 'auto', minHeight: 20 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={notification.email}
                          onChange={(e) => handleNotificationChange(notification.id, 'email', e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={notification.app}
                          onChange={(e) => handleNotificationChange(notification.id, 'app', e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={notification.sms}
                          onChange={(e) => handleNotificationChange(notification.id, 'sms', e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                          {notification.description}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </SettingsCard>

        <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="E-posta Sunucu Ayarları" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="SMTP Sunucusu"
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtpServer: e.target.value
                    })}
                    size="small"
                  />
                  
                  <TextField
                    label="Port"
                    type="number"
                    value={emailSettings.port}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      port: parseInt(e.target.value)
                    })}
                    size="small"
                  />
                  
                  <TextField
                    label="Kullanıcı Adı"
                    value={emailSettings.username}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      username: e.target.value
                    })}
                    size="small"
                  />
                  
                  <TextField
                    label="Parola"
                    type={showPassword ? 'text' : 'password'}
                    value={emailSettings.password}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      password: e.target.value
                    })}
                    size="small"
                  />

                  <TextField
                    label="Gönderici Adı"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      senderName: e.target.value
                    })}
                    size="small"
                  />

                  <FormControlLabel
                    control={
                      <Switch 
                        checked={emailSettings.enableTLS}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          enableTLS: e.target.checked
                        })}
                      />
                    }
                    label="TLS/SSL Şifreleme"
                  />
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<EmailIcon />}
                    onClick={handleTestEmailConnection}
                    disabled={loading}
                  >
                    E-posta Bağlantısını Test Et
                  </Button>
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="Otomatik Hatırlatıcılar" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Parola Süresi Uyarısı"
                      secondary="Süre dolmadan 7 gün önce hatırlat"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <DateRangeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Prosedür Gözden Geçirme"
                      secondary="Kalite prosedürleri 6 ayda bir gözden geçirilsin"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Standart Güncellemeleri"
                      secondary="ISO standartları güncellendiğinde bildir"
                    />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>
      </TabContent>

      {/* 6. Kalite Standartları Yönetimi */}
      <TabContent value={activeTab} index={5}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader 
                title="Aktif Kalite Standartları"
                action={
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    size="small"
                    onClick={() => handleStandardAction('add')}
                  >
                    Standart Ekle
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {standards.filter(s => s.category === 'quality').map((standard) => (
                    <ListItem key={standard.id}>
                      <ListItemIcon>
                        <QualityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {standard.code}
                            </Typography>
                            <Chip 
                              label={standard.version} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              {standard.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {standard.description}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title="Düzenle">
                            <IconButton 
                              size="small"
                              onClick={() => handleStandardAction('edit', standard)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteStandard(standard.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Switch 
                            checked={standard.active}
                            onChange={() => handleStandardToggle(standard.id)}
                            size="small"
                          />
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader 
                title="Sistem ve Güvenlik Standartları"
                action={
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    size="small"
                    onClick={() => handleStandardAction('add')}
                  >
                    Standart Ekle
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {standards.filter(s => s.category !== 'quality').map((standard) => (
                    <ListItem key={standard.id}>
                      <ListItemIcon>
                        <CheckCircleIcon color={getStandardColor(standard.category) as any} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {standard.code}
                            </Typography>
                            <Chip 
                              label={standard.category} 
                              size="small" 
                              color={getStandardColor(standard.category) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              {standard.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {standard.description}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title="Düzenle">
                            <IconButton 
                              size="small"
                              onClick={() => handleStandardAction('edit', standard)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteStandard(standard.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Switch 
                            checked={standard.active}
                            onChange={() => handleStandardToggle(standard.id)}
                            size="small"
                          />
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>

        <SettingsCard sx={{ mt: 3 }}>
          <CardHeader title="Standart Parametreleri ve Varsayılan Değerler" />
          <CardContent>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Kalite Kriterleri Tablosu</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Genel kalite kriterlerini ve kabul limitlerini yönet.
                </Typography>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  Tabloyu Düzenle
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Süreç Kodları ve Tanımları</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Standart süreç kodları ve açıklamaları.
                </Typography>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  Kodları Düzenle
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Test ve Ölçüm Ekipmanları</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Kalibrasyon ve bakım takvimleriyle ölçüm ekipmanları.
                </Typography>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  Ekipmanları Yönet
                </Button>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </SettingsCard>
      </TabContent>

      {/* 7. Entegrasyon Ayarları */}
      <TabContent value={activeTab} index={6}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="Harici Sistem Bağlantıları" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={integrationSettings.erpConnection}
                          onChange={(e) => setIntegrationSettings({
                            ...integrationSettings,
                            erpConnection: e.target.checked
                          })}
                        />
                      }
                      label="ERP Sistemi Entegrasyonu"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      SAP, Oracle ERP ile malzeme ve kalite verilerinin senkronizasyonu
                    </Typography>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={integrationSettings.mesConnection}
                          onChange={(e) => setIntegrationSettings({
                            ...integrationSettings,
                            mesConnection: e.target.checked
                          })}
                        />
                      }
                      label="MES Sistemi Entegrasyonu"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Üretim yürütme sistemi ile kalite verilerinin otomatik aktarımı
                    </Typography>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={integrationSettings.crmConnection}
                          onChange={(e) => setIntegrationSettings({
                            ...integrationSettings,
                            crmConnection: e.target.checked
                          })}
                        />
                      }
                      label="CRM Sistemi Entegrasyonu"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Müşteri yönetim sistemi ile kalite sertifikaları ve raporların paylaşımı
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </SettingsCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <SettingsCard>
              <CardHeader title="API ve Webhook Ayarları" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="API Anahtarı"
                    type="password"
                    value={integrationSettings.apiKey}
                    onChange={(e) => setIntegrationSettings({
                      ...integrationSettings,
                      apiKey: e.target.value
                    })}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <IconButton size="small">
                          <VpnKeyIcon />
                        </IconButton>
                      )
                    }}
                  />

                  <TextField
                    label="Webhook URL"
                    value={integrationSettings.webhookUrl}
                    onChange={(e) => setIntegrationSettings({
                      ...integrationSettings,
                      webhookUrl: e.target.value
                    })}
                    size="small"
                    placeholder="https://api.sirket.com/webhook"
                  />

                  <FormControl size="small">
                    <InputLabel>Senkronizasyon Sıklığı</InputLabel>
                    <Select
                      value={integrationSettings.syncFrequency}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        syncFrequency: e.target.value
                      })}
                    >
                      <MenuItem value="realtime">Gerçek Zamanlı</MenuItem>
                      <MenuItem value="hourly">Saatlik</MenuItem>
                      <MenuItem value="daily">Günlük</MenuItem>
                      <MenuItem value="weekly">Haftalık</MenuItem>
                    </Select>
                  </FormControl>

                  <Button variant="outlined" startIcon={<ApiIcon />} fullWidth>
                    API Bağlantısını Test Et
                  </Button>
                </Box>
              </CardContent>
            </SettingsCard>

            <SettingsCard sx={{ mt: 2 }}>
              <CardHeader title="Veri Mapping" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Harici sistemlerle kalite verileri alanları eşleştirmesi
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Müşteri Kodları"
                      secondary="CRM → KYS eşleştirmesi"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Düzenle
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ürün Kodları"
                      secondary="ERP → KYS eşleştirmesi"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Düzenle
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Departman Kodları"
                      secondary="HR → KYS eşleştirmesi"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Düzenle
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </SettingsCard>
          </Box>
        </Box>
      </TabContent>

      {/* Global Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Button 
          variant="outlined" 
          startIcon={<CancelIcon />}
          onClick={() => window.location.reload()}
        >
          Değişiklikleri İptal Et
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={handleSaveSettings}
          disabled={loading}
          size="large"
        >
          Tüm Ayarları Kaydet
        </Button>
      </Box>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Ad Soyad"
              value={userForm.name}
              onChange={(e) => setUserForm({...userForm, name: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="E-posta"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
                                            <Select 
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
              >
                <MenuItem value="Sistem Yöneticisi">Sistem Yöneticisi</MenuItem>
                <MenuItem value="Kalite Uzmanı">Kalite Uzmanı</MenuItem>
                <MenuItem value="Süreç Uzmanı">Süreç Uzmanı</MenuItem>
                <MenuItem value="Görüntüleyici">Görüntüleyici</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Departman</InputLabel>
              <Select 
                value={userForm.department}
                onChange={(e) => setUserForm({...userForm, department: e.target.value})}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Checkbox defaultChecked={userForm.active} />}
              label="Aktif kullanıcı"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSaveUser} variant="contained" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={departmentDialogOpen} onClose={() => setDepartmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDepartment ? 'Departman Düzenle' : 'Yeni Departman Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Departman Adı"
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Departman Müdürü"
              value={departmentForm.manager}
              onChange={(e) => setDepartmentForm({...departmentForm, manager: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Açıklama"
              value={departmentForm.description}
              onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
            />

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSaveDepartment} variant="contained" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Standard Dialog */}
      <Dialog open={standardDialogOpen} onClose={() => setStandardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedStandard ? 'Standart Düzenle' : 'Yeni Standart Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Standart Kodu"
              value={standardForm.code}
              onChange={(e) => setStandardForm({...standardForm, code: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Standart Adı"
              value={standardForm.name}
              onChange={(e) => setStandardForm({...standardForm, name: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Versiyon"
              value={standardForm.version}
              onChange={(e) => setStandardForm({...standardForm, version: e.target.value})}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Kategori</InputLabel>
              <Select 
                value={standardForm.category}
                onChange={(e) => setStandardForm({...standardForm, category: e.target.value as any})}
              >
                <MenuItem value="quality">Kalite</MenuItem>
                <MenuItem value="testing">Test</MenuItem>
                <MenuItem value="safety">Güvenlik</MenuItem>
                <MenuItem value="security">Sistem Güvenliği</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Açıklama"
              value={standardForm.description}
              onChange={(e) => setStandardForm({...standardForm, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={standardForm.active}
                  onChange={(e) => setStandardForm({...standardForm, active: e.target.checked})}
                />
              }
              label="Aktif standart"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStandardDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSaveStandard} variant="contained" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Module Permissions Dialog */}
      <Dialog open={permissionDialogOpen} onClose={() => setPermissionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Modül Yetkileri - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Modül</TableCell>
                    <TableCell align="center">Görüntüleme</TableCell>
                    <TableCell align="center">Düzenleme</TableCell>
                    <TableCell align="center">Silme</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedUser?.modulePermissions.map((permission) => (
                    <TableRow key={permission.moduleId}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {permission.moduleName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={permission.canView}
                          onChange={(e) => handleUpdateModulePermission(permission.moduleId, 'canView', e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={permission.canEdit}
                          onChange={(e) => handleUpdateModulePermission(permission.moduleId, 'canEdit', e.target.checked)}
                          size="small"
                          disabled={!permission.canView}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={permission.canDelete}
                          onChange={(e) => handleUpdateModulePermission(permission.moduleId, 'canDelete', e.target.checked)}
                          size="small"
                          disabled={!permission.canEdit}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Yetki Hiyerarşisi:</strong> Silme yetkisi için düzenleme, düzenleme yetkisi için görüntüleme yetkisi gereklidir.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
};

export default Settings; 