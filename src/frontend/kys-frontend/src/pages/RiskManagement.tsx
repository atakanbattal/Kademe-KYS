// Context7 - RİSK YÖNETİMİ SİSTEMİ
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';

import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  LocalShipping as OperationIcon,
  AccountBalance as FinanceIcon,
  Gavel as ComplianceIcon,
  Nature as EnvironmentIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Lock as LockIcon
} from '@mui/icons-material';

import { WorkflowUtils } from '../utils/WorkflowEngine';
import { createDOFFromSourceRecord, checkDOFStatus, DOFCreationParams } from '../utils/dofIntegration';
import { ReportProblem as ReportIcon } from '@mui/icons-material';

// Recharts for professional charts
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip,
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Context7 - RISK INTERFACES
export interface RiskRecord {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: 'operational' | 'financial' | 'strategic' | 'compliance' | 'environmental' | 'quality' | 'safety' | 'information';
  subcategory: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed';
  owner: string;
  department: string;
  identifiedBy: string;
  identifiedDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  residualProbability?: number;
  residualImpact?: number;
  residualScore?: number;
  residualLevel?: string;
  mitigationActions: MitigationAction[];
  controlMeasures: ControlMeasure[];
  relatedStandards: string[];
  attachments: RiskAttachment[];
  comments: RiskComment[];
  workflowId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MitigationAction {
  id: string;
  description: string;
  actionType: 'preventive' | 'corrective' | 'detective' | 'directive';
  responsible: string;
  dueDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  cost?: number;
  effectiveness?: number;
  completedDate?: string;
  notes?: string;
}

export interface ControlMeasure {
  id: string;
  name: string;
  type: 'administrative' | 'technical' | 'physical' | 'organizational';
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  implementation: 'planned' | 'partial' | 'full';
  responsible: string;
  reviewFrequency: 'monthly' | 'quarterly' | 'annually';
  lastReview: string;
  nextReview: string;
}

export interface RiskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
}

export interface RiskComment {
  id: string;
  comment: string;
  commentedBy: string;
  commentDate: string;
  type: 'general' | 'assessment' | 'mitigation' | 'review';
}

// Context7 - RISK MANAGEMENT COMPONENT
const RiskManagement: React.FC = () => {
  // State Management
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRisk, setSelectedRisk] = useState<RiskRecord | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Risk Matrix Dialog States
  const [matrixDialogOpen, setMatrixDialogOpen] = useState(false);
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{probability: number, impact: number, risks: RiskRecord[]} | null>(null);

  // Context7 - Risk Matrix Definition
  const riskMatrix = {
    probability: [
      { value: 1, label: 'Çok Düşük', description: 'Yılda bir kez veya daha az' },
      { value: 2, label: 'Düşük', description: 'Yılda birkaç kez' },
      { value: 3, label: 'Orta', description: 'Ayda birkaç kez' },
      { value: 4, label: 'Yüksek', description: 'Haftada birkaç kez' },
      { value: 5, label: 'Çok Yüksek', description: 'Günlük olarak' }
    ],
    impact: [
      { value: 1, label: 'Çok Düşük', description: 'Minimum etki' },
      { value: 2, label: 'Düşük', description: 'Küçük etki' },
      { value: 3, label: 'Orta', description: 'Orta düzey etki' },
      { value: 4, label: 'Yüksek', description: 'Büyük etki' },
      { value: 5, label: 'Çok Yüksek', description: 'Kritik etki' }
    ]
  };

  // Context7 - Load risks from localStorage
  useEffect(() => {
    const loadRisks = () => {
      try {
        const savedRisks = localStorage.getItem('riskManagementData');
        if (savedRisks) {
          const parsedRisks = JSON.parse(savedRisks);
          setRisks(parsedRisks);
        } else {
          // Initialize with sample data
          const sampleRisks = generateSampleRisks();
          setRisks(sampleRisks);
          localStorage.setItem('riskManagementData', JSON.stringify(sampleRisks));
        }
      } catch (error) {
        console.error('Risk verileri yüklenirken hata:', error);
        const sampleRisks = generateSampleRisks();
        setRisks(sampleRisks);
      }
    };

    loadRisks();
  }, []);

  // Context7 - Save risks to localStorage
  const saveRisks = useCallback((updatedRisks: RiskRecord[]) => {
    try {
      localStorage.setItem('riskManagementData', JSON.stringify(updatedRisks));
      setRisks(updatedRisks);
    } catch (error) {
      console.error('Risk verileri kaydedilirken hata:', error);
    }
  }, []);

  // Context7 - Generate sample risks
  const generateSampleRisks = (): RiskRecord[] => {
    const currentDate = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return [
      {
        id: '1',
        riskId: 'RSK-2024-001',
        title: 'Kaynak Kalite Sapması',
        description: 'Kaynak işlemlerinde kalite standartlarından sapma riski',
        category: 'quality',
        subcategory: 'Kaynak Kalitesi',
        probability: 3,
        impact: 4,
        riskScore: 12,
        riskLevel: 'high',
        status: 'assessed',
        owner: 'Mehmet Yılmaz',
        department: 'Üretim',
        identifiedBy: 'Kalite Kontrol',
        identifiedDate: currentDate,
        lastReviewDate: currentDate,
        nextReviewDate: nextMonth.toISOString().split('T')[0],
        mitigationActions: [],
        controlMeasures: [],
        relatedStandards: ['ISO 9001', 'TS 3834-2'],
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        riskId: 'RSK-2024-002',
        title: 'Tedarik Zinciri Kesintisi',
        description: 'Ana tedarikçilerden kaynaklanan malzeme temin riski',
        category: 'operational',
        subcategory: 'Tedarik Zinciri',
        probability: 2,
        impact: 5,
        riskScore: 10,
        riskLevel: 'high',
        status: 'mitigated',
        owner: 'Ayşe Demir',
        department: 'Satın Alma',
        identifiedBy: 'Tedarik Uzmanı',
        identifiedDate: currentDate,
        lastReviewDate: currentDate,
        nextReviewDate: nextMonth.toISOString().split('T')[0],
        mitigationActions: [],
        controlMeasures: [],
        relatedStandards: ['ISO 9001'],
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        riskId: 'RSK-2024-003',
        title: 'İş Güvenliği Riski',
        description: 'Kaynak işlemlerinde iş güvenliği riskleri',
        category: 'safety',
        subcategory: 'İş Güvenliği',
        probability: 4,
        impact: 3,
        riskScore: 12,
        riskLevel: 'high',
        status: 'monitored',
        owner: 'Hasan Çelik',
        department: 'İSG',
        identifiedBy: 'İSG Uzmanı',
        identifiedDate: currentDate,
        lastReviewDate: currentDate,
        nextReviewDate: nextMonth.toISOString().split('T')[0],
        mitigationActions: [],
        controlMeasures: [],
        relatedStandards: ['ISO 45001'],
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  // Form State
  const [formData, setFormData] = useState<Partial<RiskRecord>>({
    title: '',
    description: '',
    category: 'operational',
    subcategory: '',
    probability: 1,
    impact: 1,
    owner: '',
    department: '',
    identifiedBy: '',
    mitigationActions: [],
    controlMeasures: [],
    relatedStandards: [],
    attachments: [],
    comments: []
  });

  // Context7 - RISK CATEGORIES
  const riskCategories = {
    'operational': {
      label: 'Operasyonel',
      shortLabel: 'Ops',
      icon: <OperationIcon />,
      color: '#2196f3',
      subcategories: [
        'Üretim Süreci',
        'Tedarik Zinciri',
        'İnsan Kaynakları',
        'Teknoloji',
        'Altyapı',
        'Süreç Yönetimi'
      ]
    },
    'financial': {
      label: 'Finansal',
      shortLabel: 'Fin',
      icon: <FinanceIcon />,
      color: '#4caf50',
      subcategories: [
        'Likidite',
        'Kredi',
        'Döviz Kuru',
        'Faiz Oranı',
        'Yatırım',
        'Bütçe'
      ]
    },
    'strategic': {
      label: 'Stratejik',
      shortLabel: 'Str',
      icon: <BusinessIcon />,
      color: '#ff9800',
      subcategories: [
        'Pazar',
        'Rekabet',
        'Müşteri',
        'İnovasyon',
        'Ortaklık',
        'Büyüme'
      ]
    },
    'compliance': {
      label: 'Uygunluk',
      shortLabel: 'Uyg',
      icon: <ComplianceIcon />,
      color: '#9c27b0',
      subcategories: [
        'Yasal Uygunluk',
        'Standart Uygunluk',
        'Sertifikasyon',
        'Denetim',
        'Raporlama',
        'Etik'
      ]
    },
    'environmental': {
      label: 'Çevresel',
      shortLabel: 'Çev',
      icon: <EnvironmentIcon />,
      color: '#8bc34a',
      subcategories: [
        'Hava Kalitesi',
        'Su Kalitesi',
        'Atık Yönetimi',
        'Enerji',
        'Gürültü',
        'İklim Değişikliği'
      ]
    },
    'quality': {
      label: 'Kalite',
      shortLabel: 'Kal',
      icon: <AssessmentIcon />,
      color: '#e91e63',
      subcategories: [
        'Ürün Kalitesi',
        'Süreç Kalitesi',
        'Müşteri Memnuniyeti',
        'Tedarikçi Kalitesi',
        'Test ve Doğrulama',
        'Uygunsuzluk'
      ]
    },
    'safety': {
      label: 'Güvenlik',
      shortLabel: 'Güv',
      icon: <SecurityIcon />,
      color: '#f44336',
      subcategories: [
        'İş Güvenliği',
        'Yangın Güvenliği',
        'Makine Güvenliği',
        'Kimyasal Güvenlik',
        'Sağlık',
        'Acil Durum'
      ]
    },
    'information': {
      label: 'Bilgi Güvenliği',
      shortLabel: 'Bil',
      icon: <InfoIcon />,
      color: '#607d8b',
      subcategories: [
        'Veri Güvenliği',
        'Siber Güvenlik',
        'Erişim Kontrolü',
        'Yedekleme',
        'Gizlilik',
        'Sistem Güvenliği'
      ]
    }
  };



  // Context7 - RISK LEVEL HESAPLAMA
  const calculateRiskLevel = (probability: number, impact: number): { score: number; level: string } => {
    const score = probability * impact;
    
    let level: string;
    if (score <= 4) level = 'very_low';
    else if (score <= 8) level = 'low';
    else if (score <= 12) level = 'medium';
    else if (score <= 20) level = 'high';
    else level = 'very_high';

    return { score, level };
  };

  // Context7 - RISK LEVEL COLORS
  const getRiskLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      'very_low': '#4caf50',
      'low': '#8bc34a',
      'medium': '#ff9800',
      'high': '#f44336',
      'very_high': '#d32f2f'
    };
    return colors[level] || '#9e9e9e';
  };

  const getRiskLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
      'very_low': 'Çok Düşük',
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'very_high': 'Çok Yüksek'
    };
    return labels[level] || 'Bilinmiyor';
  };

  // Risk durumu çevirisi
  const getRiskStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'identified': 'Tespit Edildi',
      'assessed': 'Değerlendirildi',
      'mitigated': 'Azaltıldı',
      'monitored': 'İzleniyor',
      'closed': 'Kapatıldı'
    };
    return statusLabels[status] || status;
  };

  // Risk durumu rengi
  const getRiskStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'identified': '#ff9800', // Turuncu
      'assessed': '#2196f3',   // Mavi
      'mitigated': '#4caf50',  // Yeşil
      'monitored': '#9c27b0',  // Mor
      'closed': '#607d8b'      // Gri
    };
    return statusColors[status] || '#757575';
  };

  const saveToLocalStorage = useCallback((data: RiskRecord[]) => {
    try {
      localStorage.setItem('riskRecords', JSON.stringify(data));
      console.log('Context7 - Risk verileri kaydedildi');
    } catch (error) {
      console.error('Context7 - Risk kaydetme hatası:', error);
    }
  }, []);

  const initializeSampleData = useCallback(() => {
    const sampleRisks: RiskRecord[] = [
      {
        id: 'risk-001',
        riskId: 'RISK-2024-001',
        title: 'Tedarikçi Kalite Riski',
        description: 'Ana tedarikçiden gelen malzemelerde kalite sapmaları',
        category: 'quality',
        subcategory: 'Tedarikçi Kalitesi',
        probability: 3,
        impact: 4,
        riskScore: 12,
        riskLevel: 'medium',
        status: 'assessed',
        owner: 'Kalite Müdürü',
        department: 'Kalite Güvence',
        identifiedBy: 'Mehmet Yılmaz',
        identifiedDate: '2024-01-15',
        lastReviewDate: '2024-06-01',
        nextReviewDate: '2024-09-01',
        mitigationActions: [
          {
            id: 'action-001',
            description: 'Tedarikçi denetimi artırılması',
            actionType: 'preventive',
            responsible: 'Kalite Kontrol Sorumlusu',
            dueDate: '2024-07-15',
            status: 'in_progress',
            priority: 'high'
          }
        ],
        controlMeasures: [
          {
            id: 'control-001',
            name: 'Gelen Malzeme Kontrolü',
            type: 'technical',
            description: 'Tüm gelen malzemelerin %100 kontrolü',
            effectiveness: 'high',
            implementation: 'full',
            responsible: 'Kalite Kontrol',
            reviewFrequency: 'monthly',
            lastReview: '2024-05-01',
            nextReview: '2024-06-01'
          }
        ],
        relatedStandards: ['ISO 9001', 'TS 16949'],
        attachments: [],
        comments: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-06-01T14:30:00Z'
      },
      {
        id: 'risk-002',
        riskId: 'RISK-2024-002',
        title: 'Makine Arıza Riski',
        description: 'Kritik üretim makinelerinde beklenmedik arızalar',
        category: 'operational',
        subcategory: 'Üretim Süreci',
        probability: 2,
        impact: 5,
        riskScore: 10,
        riskLevel: 'medium',
        status: 'mitigated',
        owner: 'Üretim Müdürü',
        department: 'Üretim',
        identifiedBy: 'Ayşe Demir',
        identifiedDate: '2024-02-01',
        lastReviewDate: '2024-05-15',
        nextReviewDate: '2024-08-15',
        mitigationActions: [
          {
            id: 'action-002',
            description: 'Preventif bakım programının güçlendirilmesi',
            actionType: 'preventive',
            responsible: 'Bakım Sorumlusu',
            dueDate: '2024-06-30',
            status: 'completed',
            priority: 'medium',
            completedDate: '2024-06-25'
          }
        ],
        controlMeasures: [
          {
            id: 'control-002',
            name: 'Preventif Bakım Takibi',
            type: 'administrative',
            description: 'Planlı bakım programı ve takibi',
            effectiveness: 'medium',
            implementation: 'full',
            responsible: 'Bakım Ekibi',
            reviewFrequency: 'quarterly',
            lastReview: '2024-04-01',
            nextReview: '2024-07-01'
          }
        ],
        relatedStandards: ['ISO 55001'],
        attachments: [],
        comments: [],
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-06-25T16:00:00Z'
      }
    ];

    setRisks(sampleRisks);
    saveToLocalStorage(sampleRisks);
    console.log('Context7 - Örnek risk verileri yüklendi');
  }, [saveToLocalStorage]);

  const loadRiskData = useCallback(() => {
    try {
      const storedRisks = localStorage.getItem('riskRecords');
      if (storedRisks) {
        const parsed = JSON.parse(storedRisks);
        if (Array.isArray(parsed)) {
          setRisks(parsed);
          console.log('Context7 - Risk verileri yüklendi:', parsed.length, 'kayıt');
        }
      } else {
        // Örnek veri yükle
        initializeSampleData();
      }
    } catch (error) {
      console.error('Context7 - Risk veri yükleme hatası:', error);
      setRisks([]);
    }
  }, [initializeSampleData]);

  // Context7 - DATA LOADING
  useEffect(() => {
    loadRiskData();
  }, [loadRiskData]);

  // Context7 - DIALOG FUNCTIONS
  const openCreateDialog = () => {
    setDialogMode('create');
    setCurrentStep(0);
    setFormData({
      title: '',
      description: '',
      category: 'operational',
      subcategory: '',
      probability: 1,
      impact: 1,
      owner: '',
      department: '',
      identifiedBy: '',
      mitigationActions: [],
      controlMeasures: [],
      relatedStandards: [],
      attachments: [],
      comments: []
    });
    setSelectedRisk(null);
    setOpenDialog(true);
  };

  const openEditDialog = (risk: RiskRecord) => {
    setDialogMode('edit');
    setCurrentStep(0);
    setFormData(risk);
    setSelectedRisk(risk);
    setOpenDialog(true);
  };

  const openViewDialog = (risk: RiskRecord) => {
    setDialogMode('view');
    setFormData(risk);
    setSelectedRisk(risk);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedRisk(null);
    setCurrentStep(0);
    setFormData({});
  };

  // Context7 - SAVE RISK
  const handleSaveRisk = () => {
    try {
      const { score, level } = calculateRiskLevel(formData.probability || 1, formData.impact || 1);
      
      const riskData: RiskRecord = {
        ...formData,
        id: selectedRisk?.id || `risk-${Date.now()}`,
        riskId: selectedRisk?.riskId || `RISK-${new Date().getFullYear()}-${String(risks.length + 1).padStart(3, '0')}`,
        riskScore: score,
        riskLevel: level as any,
        status: selectedRisk?.status || 'identified',
        identifiedDate: formData.identifiedDate || new Date().toISOString().split('T')[0],
        lastReviewDate: dialogMode === 'edit' ? new Date().toISOString().split('T')[0] : (formData.lastReviewDate || ''),
        nextReviewDate: formData.nextReviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: selectedRisk?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mitigationActions: formData.mitigationActions || [],
        controlMeasures: formData.controlMeasures || [],
        relatedStandards: formData.relatedStandards || [],
        attachments: formData.attachments || [],
        comments: formData.comments || []
      } as RiskRecord;

      let updatedRisks: RiskRecord[];
      
      if (dialogMode === 'create') {
        updatedRisks = [riskData, ...risks];
        
        // Risk workflow başlat
        try {
          const workflow = WorkflowUtils.startDOFWorkflow(riskData.riskId, riskData, 'Risk Yöneticisi');
          riskData.workflowId = workflow.id;
          console.log('Context7 - Risk workflow başlatıldı:', workflow.id);
        } catch (error) {
          console.warn('Context7 - Workflow başlatma uyarısı:', error);
        }
      } else {
        updatedRisks = risks.map(r => r.id === selectedRisk!.id ? riskData : r);
      }

      setRisks(updatedRisks);
      saveToLocalStorage(updatedRisks);
      closeDialog();

      const action = dialogMode === 'create' ? 'oluşturuldu' : 'güncellendi';
      alert(`Risk başarıyla ${action}!\n\nRisk ID: ${riskData.riskId}\nRisk Seviyesi: ${getRiskLevelLabel(riskData.riskLevel)}\nSkor: ${riskData.riskScore}`);
      
    } catch (error) {
      console.error('Context7 - Risk kaydetme hatası:', error);
      alert('Risk kaydedilirken hata oluştu!');
    }
  };

  // Context7 - DELETE RISK
  const handleDeleteRisk = (risk: RiskRecord) => {
    if (window.confirm(`${risk.riskId} - ${risk.title} riskini silmek istediğinizden emin misiniz?`)) {
      const updatedRisks = risks.filter(r => r.id !== risk.id);
      setRisks(updatedRisks);
      saveToLocalStorage(updatedRisks);
      alert('Risk başarıyla silindi!');
    }
  };

  // DÖF oluşturma fonksiyonu
  const handleCreateDOF = (risk: RiskRecord) => {
    try {
      // DÖF form verilerini hazırla
      const dofFormData = {
        title: `Risk Yönetimi - ${risk.title}`,
        description: `Risk ID: ${risk.riskId}\n\nRisk Açıklaması: ${risk.description}\n\nRisk Kategorisi: ${riskCategories[risk.category]?.label}\nRisk Seviyesi: ${getRiskLevelLabel(risk.riskLevel)}\nRisk Skoru: ${risk.riskScore}/25\n\nSorumlu: ${risk.owner}\nDepartman: ${risk.department}\n\nTespit Eden: ${risk.identifiedBy}\nTespit Tarihi: ${risk.identifiedDate}`,
        type: 'corrective',
        department: risk.department,
        responsible: risk.owner,
        priority: risk.riskLevel === 'very_high' ? 'critical' : 
                 risk.riskLevel === 'high' ? 'high' : 
                 risk.riskLevel === 'medium' ? 'medium' : 'low',
        status: 'open',
        sourceModule: 'riskManagement',
        sourceRecordId: risk.riskId
      };

      // DÖF form verilerini localStorage'a kaydet (prefill için)
      localStorage.setItem('dof-form-prefill', JSON.stringify(dofFormData));
      
      // DÖF sayfasına yönlendir
      window.open('/dof-8d-management', '_blank');
      
      alert('DÖF formu hazırlandı! Yeni sekmede DÖF Yönetimi sayfası açıldı ve form otomatik dolduruldu.');
      
    } catch (error) {
      console.error('DÖF oluşturma hatası:', error);
      alert('DÖF oluşturulurken bir hata oluştu.');
    }
  };

  // Risk kapatma fonksiyonu
  const handleCloseRisk = (risk: RiskRecord) => {
    const confirmClose = window.confirm(
      `"${risk.title}" riskini kapatmak istediğinizden emin misiniz?\n\nRisk kapandığında artık aktif olmayacak ve sadece görüntüleme modunda erişilebilecektir.`
    );
    
    if (confirmClose) {
      try {
        const updatedRisks = risks.map(r => 
          r.id === risk.id 
            ? { 
                ...r, 
                status: 'closed' as const, 
                lastReviewDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                comments: [
                  ...r.comments,
                  {
                    id: `comment_${Date.now()}`,
                    comment: `Risk kapatıldı. Kapatma tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
                    commentedBy: 'Sistem',
                    commentDate: new Date().toISOString(),
                    type: 'general' as const
                  }
                ]
              }
            : r
        );
        
        setRisks(updatedRisks);
        localStorage.setItem('riskManagementData', JSON.stringify(updatedRisks));
        
        alert(`"${risk.title}" riski başarıyla kapatıldı.`);
      } catch (error) {
        console.error('Risk kapatma hatası:', error);
        alert('Risk kapatılırken bir hata oluştu.');
      }
    }
  };

  // Context7 - RISK STATISTICS
  const getRiskStatistics = () => {
    const total = risks.length;
    const byLevel = risks.reduce((acc, risk) => {
      acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = risks.reduce((acc, risk) => {
      acc[risk.status] = (acc[risk.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = risks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byLevel, byStatus, byCategory };
  };

  const stats = getRiskStatistics();

  // Context7 - RENDER
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Risk Yönetimi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          size="large"
        >
          Yeni Risk Ekle
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {(stats.byLevel.high || 0) + (stats.byLevel.very_high || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yüksek Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.byLevel.medium || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Orta Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {(stats.byLevel.low || 0) + (stats.byLevel.very_low || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Düşük Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Risk Listesi" icon={<AssessmentIcon />} />
          <Tab label="Risk Matrisi" icon={<TimelineIcon />} />
          <Tab label="Raporlar" icon={<TrendingUpIcon />} />
          <Tab label="Risk Azaltma Analizi" icon={<WarningIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper 
          sx={{ 
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}
        >
          {/* Professional Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 50%, #42a5f5 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <AssessmentIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Risk Yönetimi - Aktif Riskler Listesi
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${risks.filter(r => r.status !== 'closed').length} Aktif Risk`}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>

          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 100, 
                      width: 100,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    Risk ID
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 200, 
                      width: 200,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    Risk
                  </TableCell>
                                     <TableCell 
                     sx={{ 
                       fontWeight: 'bold', 
                       minWidth: 150, 
                       width: 150,
                       bgcolor: 'grey.100',
                       borderBottom: '2px solid #1565c0',
                       position: 'sticky',
                       top: 0,
                       zIndex: 1
                     }}
                   >
                     Kategori
                   </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 120, 
                      width: 120,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    Seviye
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 130, 
                      width: 130,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    Durum
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 150, 
                      width: 150,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    Sorumlu
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 120, 
                      width: 120,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    Son İnceleme
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: 160, 
                      width: 160,
                      bgcolor: 'grey.100',
                      borderBottom: '2px solid #1565c0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {risks.map((risk, index) => (
                  <TableRow 
                    key={risk.id}
                    sx={{ 
                      height: 65,
                      cursor: 'pointer',
                      borderLeft: `4px solid ${
                        risk.riskLevel === 'very_high' ? '#d32f2f' :
                        risk.riskLevel === 'high' ? '#f57c00' :
                        risk.riskLevel === 'medium' ? '#fbc02d' :
                        risk.riskLevel === 'low' ? '#689f38' : '#388e3c'
                      }`,
                      '&:hover': { 
                        bgcolor: risk.status === 'closed' ? 'grey.100' : 'action.hover',
                        transform: 'scale(1.002)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      },
                      '&:nth-of-type(even)': { 
                        bgcolor: risk.status === 'closed' ? 'grey.50' : 'grey.25' 
                      },
                      opacity: risk.status === 'closed' ? 0.6 : 1,
                      position: 'relative'
                    }}
                  >
                    <TableCell sx={{ width: 100 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          sx={{ 
                            fontSize: '0.8rem',
                            color: 'primary.main',
                            fontFamily: 'monospace'
                          }}
                        >
                         {risk.riskId}
                        </Typography>
                        {risk.status === 'closed' && (
                          <Chip
                            label="KAPALI"
                            size="small"
                            sx={{
                              fontSize: '0.6rem',
                              height: 16,
                              bgcolor: 'grey.300',
                              color: 'grey.700',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                     <TableCell sx={{ width: 200 }}>
                       <Box>
                         <Typography 
                           variant="body2"
                           sx={{ 
                             fontSize: '0.85rem',
                             fontWeight: risk.status === 'closed' ? 'normal' : 'medium',
                             overflow: 'hidden',
                             textOverflow: 'ellipsis',
                             whiteSpace: 'nowrap',
                             color: risk.status === 'closed' ? 'text.secondary' : 'text.primary'
                           }}
                           title={risk.title}
                         >
                          {risk.title}
                        </Typography>
                        <Typography 
                          variant="caption"
                          sx={{ 
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={risk.description}
                        >
                          {risk.description.substring(0, 50)}...
                        </Typography>
                       </Box>
                    </TableCell>
                     <TableCell sx={{ width: 150 }}>
                      <Chip
                         icon={React.cloneElement(riskCategories[risk.category].icon, { sx: { fontSize: '0.8rem !important' } })}
                        label={riskCategories[risk.category].label}
                        size="small"
                        sx={{ 
                          backgroundColor: riskCategories[risk.category].color + '20',
                           color: riskCategories[risk.category].color,
                           fontSize: '0.75rem',
                           height: 28,
                           fontWeight: 'bold',
                           maxWidth: '140px',
                           '& .MuiChip-label': {
                             px: 1,
                             whiteSpace: 'nowrap',
                             overflow: 'hidden',
                             textOverflow: 'ellipsis',
                             maxWidth: '120px'
                           },
                           '&:hover': {
                             backgroundColor: riskCategories[risk.category].color + '30',
                             transform: 'scale(1.02)',
                             transition: 'all 0.2s ease'
                           }
                         }}
                         title={riskCategories[risk.category].label}
                      />
                    </TableCell>
                     <TableCell sx={{ width: 120 }}>
                       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                      <Chip
                           label={getRiskLevelLabel(risk.riskLevel)}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(risk.riskLevel),
                          color: 'white',
                             fontWeight: 'bold',
                             fontSize: '0.7rem',
                             height: 20,
                             '& .MuiChip-label': { px: 0.8 }
                           }}
                         />
                         <Typography 
                           variant="caption" 
                           align="center"
                           sx={{ 
                             fontSize: '0.65rem',
                             color: 'text.secondary',
                             fontWeight: 'bold'
                           }}
                         >
                           {risk.riskScore}
                         </Typography>
                       </Box>
                    </TableCell>
                     <TableCell sx={{ width: 130 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          label={getRiskStatusLabel(risk.status)}
                          size="small"
                          variant={risk.status === 'closed' ? 'filled' : 'outlined'}
                          sx={{
                            borderColor: getRiskStatusColor(risk.status),
                            bgcolor: risk.status === 'closed' ? getRiskStatusColor(risk.status) : 'transparent',
                            color: risk.status === 'closed' ? 'white' : getRiskStatusColor(risk.status),
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 26,
                            '& .MuiChip-label': { 
                              px: 1,
                              whiteSpace: 'nowrap'
                            },
                            border: risk.status === 'closed' ? 'none' : `2px solid ${getRiskStatusColor(risk.status)}`
                          }}
                          title={getRiskStatusLabel(risk.status)}
                        />
                        {risk.status === 'closed' && (
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                            {new Date(risk.updatedAt || risk.lastReviewDate).toLocaleDateString('tr-TR')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                     <TableCell sx={{ width: 150 }}>
                       <Typography 
                         variant="body2"
                         sx={{ 
                           fontSize: '0.8rem',
                           fontWeight: 'medium',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           whiteSpace: 'nowrap'
                         }}
                         title={`${risk.owner} - ${risk.department}`}
                       >
                        {risk.owner}
                      </Typography>
                    </TableCell>
                     <TableCell sx={{ width: 120 }}>
                       <Typography 
                         variant="body2"
                         sx={{ 
                           fontSize: '0.75rem',
                           textAlign: 'center',
                           color: risk.lastReviewDate && risk.lastReviewDate !== '' ? 'text.primary' : 'text.secondary',
                           fontStyle: risk.lastReviewDate && risk.lastReviewDate !== '' ? 'normal' : 'italic'
                         }}
                       >
                         {risk.lastReviewDate && risk.lastReviewDate !== '' 
                           ? new Date(risk.lastReviewDate).toLocaleDateString('tr-TR')
                           : '-'
                         }
                      </Typography>
                    </TableCell>
                     <TableCell sx={{ width: 160 }}>
                      <Box display="flex" gap={0.5} justifyContent="center" flexWrap="wrap">
                        <Tooltip title="Görüntüle" arrow>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openViewDialog(risk);
                            }}
                            sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: 'primary.50',
                              '&:hover': { 
                                bgcolor: 'primary.100',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </IconButton>
                        </Tooltip>
                        
                        {risk.status !== 'closed' && (
                          <>
                            <Tooltip title="Düzenle" arrow>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(risk);
                                }}
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: 'info.50',
                                  '&:hover': { 
                                    bgcolor: 'info.100',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <EditIcon sx={{ fontSize: 16, color: 'info.main' }} />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Risk Kapat" arrow>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseRisk(risk);
                                }}
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: 'success.50',
                                  '&:hover': { 
                                    bgcolor: 'success.100',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              </IconButton>
                            </Tooltip>
                            
                            {(risk.riskLevel === 'high' || risk.riskLevel === 'very_high') && (
                              <Tooltip title="Uygunsuzluk Oluştur" arrow>
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateDOF(risk);
                                  }}
                                  sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: 'warning.50',
                                    '&:hover': { 
                                      bgcolor: 'warning.100',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <ReportIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                        
                        {risk.status === 'closed' && (
                          <Tooltip title="Risk Kapalı" arrow>
                            <IconButton 
                              size="small" 
                              disabled
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: 'grey.200'
                              }}
                            >
                              <LockIcon sx={{ fontSize: 16, color: 'grey.500' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Sil" arrow>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRisk(risk);
                            }}
                            sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: 'error.50',
                              '&:hover': { 
                                bgcolor: 'error.100',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Risk Matrisi
          </Typography>
          
          {/* Risk Matrix Grid */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Değerlendirme Matrisi (Olasılık × Etki)
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Olasılık / Etki
                    </TableCell>
                    {[1, 2, 3, 4, 5].map(impact => (
                      <TableCell key={impact} align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                        {impact}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[5, 4, 3, 2, 1].map(probability => (
                    <TableRow key={probability}>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                        {probability}
                      </TableCell>
                      {[1, 2, 3, 4, 5].map(impact => {
                        const score = probability * impact;
                        const level = score <= 4 ? 'very_low' : score <= 8 ? 'low' : score <= 12 ? 'medium' : score <= 20 ? 'high' : 'very_high';
                        const risksInCell = risks.filter(r => r.probability === probability && r.impact === impact);
                        
                        return (
                          <TableCell 
                            key={impact} 
                            align="center"
                            sx={{ 
                              bgcolor: getRiskLevelColor(level) + '40',
                              border: 1,
                              borderColor: getRiskLevelColor(level),
                              minWidth: 80,
                              height: 60,
                              cursor: risksInCell.length > 0 ? 'pointer' : 'default',
                              '&:hover': risksInCell.length > 0 ? {
                                bgcolor: getRiskLevelColor(level) + '60',
                                transform: 'scale(1.02)',
                                transition: 'all 0.2s ease'
                              } : {}
                            }}
                            onClick={() => {
                              if (risksInCell.length > 0) {
                                setSelectedMatrixCell({
                                  probability,
                                  impact,
                                  risks: risksInCell
                                });
                                setMatrixDialogOpen(true);
                              }
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {score}
                            </Typography>
                            <Typography variant="caption" display="block">
                              ({risksInCell.length} risk)
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Risk Level Legend */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {[
              { level: 'very_low', label: 'Çok Düşük (1-4)', range: '1-4' },
              { level: 'low', label: 'Düşük (5-8)', range: '5-8' },
              { level: 'medium', label: 'Orta (9-12)', range: '9-12' },
              { level: 'high', label: 'Yüksek (13-20)', range: '13-20' },
              { level: 'very_high', label: 'Çok Yüksek (21-25)', range: '21-25' }
            ].map(item => (
              <Chip
                key={item.level}
                label={item.label}
                sx={{
                  backgroundColor: getRiskLevelColor(item.level),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            ))}
          </Box>

          {/* Risk Distribution by Category */}
          <Typography variant="h6" gutterBottom>
            Kategori Bazlı Risk Dağılımı
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(riskCategories).map(([key, category]) => {
              const categoryRisks = risks.filter(r => r.category === key);
              return (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {category.icon}
                        <Typography variant="subtitle2" fontWeight="bold">
                          {category.label}
                        </Typography>
                      </Box>
                      <Typography variant="h4" color={category.color}>
                        {categoryRisks.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Risk
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Risk Raporları ve Analizler
          </Typography>
          
          {/* Risk Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Risk Seviye Dağılımı
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { 
                              name: 'Çok Yüksek', 
                              value: risks.filter(r => r.riskLevel === 'very_high').length,
                              color: '#d32f2f'
                            },
                            { 
                              name: 'Yüksek', 
                              value: risks.filter(r => r.riskLevel === 'high').length,
                              color: '#f57c00'
                            },
                            { 
                              name: 'Orta', 
                              value: risks.filter(r => r.riskLevel === 'medium').length,
                              color: '#fbc02d'
                            },
                            { 
                              name: 'Düşük', 
                              value: risks.filter(r => r.riskLevel === 'low').length,
                              color: '#689f38'
                            },
                            { 
                              name: 'Çok Düşük', 
                              value: risks.filter(r => r.riskLevel === 'very_low').length,
                              color: '#388e3c'
                            }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { color: '#d32f2f' },
                            { color: '#f57c00' },
                            { color: '#fbc02d' },
                            { color: '#689f38' },
                            { color: '#388e3c' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          formatter={(value: any, name: any) => [`${value} Risk`, name]}
                          labelStyle={{ color: '#333' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value) => <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    Risk Durum Dağılımı
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { 
                            name: 'Tanımlandı', 
                            value: risks.filter(r => r.status === 'identified').length,
                            fill: '#1976d2'
                          },
                          { 
                            name: 'Değerlendirildi', 
                            value: risks.filter(r => r.status === 'assessed').length,
                            fill: '#0288d1'
                          },
                          { 
                            name: 'Azaltıldı', 
                            value: risks.filter(r => r.status === 'mitigated').length,
                            fill: '#0097a7'
                          },
                          { 
                            name: 'İzleniyor', 
                            value: risks.filter(r => r.status === 'monitored').length,
                            fill: '#00695c'
                          },
                          { 
                            name: 'Kapatıldı', 
                            value: risks.filter(r => r.status === 'closed').length,
                            fill: '#2e7d32'
                          }
                        ].filter(item => item.value > 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                        <ChartTooltip 
                          formatter={(value: any, name: any) => [`${value} Risk`, 'Sayı']}
                          labelStyle={{ color: '#333', fontWeight: 'bold' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[8, 8, 0, 0]}
                          stroke="#fff"
                          strokeWidth={1}
                        >
                          {[
                            { fill: '#1976d2' },
                            { fill: '#0288d1' },
                            { fill: '#0097a7' },
                            { fill: '#00695c' },
                            { fill: '#2e7d32' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Risks Table */}
          <Typography variant="h6" gutterBottom>
            En Yüksek Riskler
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Risk ID</TableCell>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Risk Skoru</TableCell>
                  <TableCell>Seviye</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Sorumlu</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {risks
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 10)
                  .map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell>{risk.riskId}</TableCell>
                      <TableCell>{risk.title}</TableCell>
                      <TableCell>
                        <Chip
                          icon={riskCategories[risk.category].icon}
                          label={riskCategories[risk.category].label}
                          size="small"
                          sx={{ 
                            backgroundColor: riskCategories[risk.category].color + '20',
                            color: riskCategories[risk.category].color
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {risk.riskScore}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRiskLevelLabel(risk.riskLevel)}
                          size="small"
                          sx={{
                            backgroundColor: getRiskLevelColor(risk.riskLevel),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={risk.status}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{risk.owner}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Risk Azaltma Analizi
          </Typography>
          
          {/* Risk Mitigation Analysis */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Before/After Comparison */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Risk Azaltma Karşılaştırması
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ height: 'auto' }}>
                    {/* Original Risk Scores */}
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
                        <Typography variant="subtitle1" gutterBottom color="error" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Mevcut Risk Durumu
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1.5,
                          maxHeight: '400px',
                          overflowY: 'auto'
                        }}>
                          {risks.map((risk) => (
                            <Card key={risk.id} variant="outlined" sx={{ border: '1px solid #e0e0e0' }}>
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                  {risk.riskId} - {risk.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={`Mevcut: ${risk.riskScore}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: getRiskLevelColor(risk.riskLevel),
                                      color: 'white',
                                      fontWeight: 'bold',
                                      minWidth: '80px'
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Olasılık: {risk.probability} × Etki: {risk.impact}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Residual Risk Scores */}
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
                        <Typography variant="subtitle1" gutterBottom color="success.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Hedef Risk Durumu (Azaltma Sonrası)
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1.5,
                          maxHeight: '400px',
                          overflowY: 'auto'
                        }}>
                          {risks.map((risk) => {
                            // Simulate residual risk calculation
                            const residualProbability = risk.residualProbability || Math.max(1, risk.probability - 1);
                            const residualImpact = risk.residualImpact || Math.max(1, risk.impact - 1);
                            const residualScore = residualProbability * residualImpact;
                            const residualLevel = residualScore <= 4 ? 'very_low' : 
                                                residualScore <= 8 ? 'low' : 
                                                residualScore <= 12 ? 'medium' : 
                                                residualScore <= 20 ? 'high' : 'very_high';
                            const improvement = risk.riskScore - residualScore;
                            const improvementPercentage = ((improvement / risk.riskScore) * 100).toFixed(1);
                            
                            return (
                              <Card key={risk.id} variant="outlined" sx={{ border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                    {risk.riskId} - {risk.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                    <Chip
                                      label={`Hedef: ${residualScore}`}
                                      size="small"
                                      sx={{
                                        backgroundColor: getRiskLevelColor(residualLevel),
                                        color: 'white',
                                        fontWeight: 'bold',
                                        minWidth: '80px'
                                      }}
                                    />
                                    <Chip
                                      label={`-%${improvementPercentage} iyileşme`}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Hedef Olasılık: {residualProbability} × Hedef Etki: {residualImpact}
                                  </Typography>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Risk Reduction Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Azaltma Özeti
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(() => {
                      const totalCurrentRisk = risks.reduce((sum, risk) => sum + risk.riskScore, 0);
                      const totalResidualRisk = risks.reduce((sum, risk) => {
                        const residualScore = (risk.residualProbability || Math.max(1, risk.probability - 1)) * 
                                            (risk.residualImpact || Math.max(1, risk.impact - 1));
                        return sum + residualScore;
                      }, 0);
                      const totalImprovement = totalCurrentRisk - totalResidualRisk;
                      const improvementPercentage = ((totalImprovement / totalCurrentRisk) * 100).toFixed(1);
                      
                      return (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Toplam Mevcut Risk Skoru:</Typography>
                            <Chip label={totalCurrentRisk} color="error" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Toplam Hedef Risk Skoru:</Typography>
                            <Chip label={totalResidualRisk} color="success" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">Risk Azaltma Oranı:</Typography>
                            <Chip 
                              label={`%${improvementPercentage} iyileşme`} 
                              color="primary" 
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                        </>
                      );
                    })()}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Risk Level Distribution Comparison */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Seviye Dağılımı Karşılaştırması
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {['very_high', 'high', 'medium', 'low', 'very_low'].map(level => {
                      const currentCount = risks.filter(r => r.riskLevel === level).length;
                      const residualCount = risks.filter(r => {
                        const residualScore = (r.residualProbability || Math.max(1, r.probability - 1)) * 
                                            (r.residualImpact || Math.max(1, r.impact - 1));
                        const residualLevel = residualScore <= 4 ? 'very_low' : 
                                            residualScore <= 8 ? 'low' : 
                                            residualScore <= 12 ? 'medium' : 
                                            residualScore <= 20 ? 'high' : 'very_high';
                        return residualLevel === level;
                      }).length;
                      
                      return (
                        <Box key={level} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={getRiskLevelLabel(level)}
                            size="small"
                            sx={{
                              backgroundColor: getRiskLevelColor(level),
                              color: 'white',
                              minWidth: 100
                            }}
                          />
                          <Typography variant="body2">
                            {currentCount} → {residualCount} risk
                          </Typography>
                          {currentCount !== residualCount && (
                            <Chip
                              label={currentCount > residualCount ? `↓${currentCount - residualCount}` : `↑${residualCount - currentCount}`}
                              size="small"
                              color={currentCount > residualCount ? "success" : "warning"}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Mitigation Actions Effectiveness */}
          <Typography variant="h6" gutterBottom>
            Risk Azaltma Eylemleri Etkinliği
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Bu analiz, risk azaltma eylemlerinin potansiyel etkisini göstermektedir. 
            Gerçek sonuçlar, uygulanan önlemlerin etkinliğine bağlı olarak değişebilir.
          </Alert>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Risk ID</TableCell>
                  <TableCell>Risk Başlığı</TableCell>
                  <TableCell>Mevcut Skor</TableCell>
                  <TableCell>Hedef Skor</TableCell>
                  <TableCell>İyileşme</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Öncelik</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {risks.map((risk) => {
                  const residualScore = (risk.residualProbability || Math.max(1, risk.probability - 1)) * 
                                      (risk.residualImpact || Math.max(1, risk.impact - 1));
                  const improvement = risk.riskScore - residualScore;
                  const improvementPercentage = ((improvement / risk.riskScore) * 100).toFixed(1);
                  const residualLevel = residualScore <= 4 ? 'very_low' : 
                                      residualScore <= 8 ? 'low' : 
                                      residualScore <= 12 ? 'medium' : 
                                      residualScore <= 20 ? 'high' : 'very_high';
                  
                  return (
                    <TableRow key={risk.id}>
                      <TableCell>{risk.riskId}</TableCell>
                      <TableCell>{risk.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={risk.riskScore}
                          size="small"
                          sx={{
                            backgroundColor: getRiskLevelColor(risk.riskLevel),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={residualScore}
                          size="small"
                          sx={{
                            backgroundColor: getRiskLevelColor(residualLevel),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`-%${improvementPercentage}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRiskStatusLabel(risk.status)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: getRiskStatusColor(risk.status),
                            color: getRiskStatusColor(risk.status)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={risk.riskLevel === 'very_high' ? 'Kritik' : 
                                risk.riskLevel === 'high' ? 'Yüksek' : 
                                risk.riskLevel === 'medium' ? 'Orta' : 'Düşük'}
                          size="small"
                          color={risk.riskLevel === 'very_high' || risk.riskLevel === 'high' ? 'error' : 
                                risk.riskLevel === 'medium' ? 'warning' : 'success'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Risk Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon />
            {dialogMode === 'create' && 'Yeni Risk Ekle'}
            {dialogMode === 'edit' && 'Risk Düzenle'}
            {dialogMode === 'view' && 'Risk Detayları'}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {dialogMode !== 'view' && (
            <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
              <Step>
                <StepLabel>Temel Bilgiler</StepLabel>
              </Step>
              <Step>
                <StepLabel>Risk Değerlendirmesi</StepLabel>
              </Step>
              <Step>
                <StepLabel>Önlemler ve Kontroller</StepLabel>
              </Step>
            </Stepper>
          )}

          {/* Step 0: Temel Bilgiler */}
          {(currentStep === 0 || dialogMode === 'view') && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Risk Başlığı"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Risk Açıklaması"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={dialogMode === 'view'}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Risk Kategorisi</InputLabel>
                  <Select
                    value={formData.category || 'operational'}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any, subcategory: ''})}
                    disabled={dialogMode === 'view'}
                  >
                    {Object.entries(riskCategories).map(([key, category]) => (
                      <MenuItem key={key} value={key}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {category.icon}
                          {category.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Alt Kategori</InputLabel>
                  <Select
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    disabled={dialogMode === 'view'}
                  >
                    {(riskCategories[formData.category || 'operational']?.subcategories || []).map((sub) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Risk Sahibi"
                  value={formData.owner || ''}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Departman"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1: Risk Değerlendirmesi */}
          {currentStep === 1 && dialogMode !== 'view' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Risk Değerlendirmesi
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Olasılık</InputLabel>
                  <Select
                    value={formData.probability || 1}
                    onChange={(e) => setFormData({...formData, probability: Number(e.target.value) as any})}
                  >
                    {riskMatrix.probability.map((prob) => (
                      <MenuItem key={prob.value} value={prob.value}>
                        <Box>
                          <Typography variant="body2">{prob.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prob.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Etki</InputLabel>
                  <Select
                    value={formData.impact || 1}
                    onChange={(e) => setFormData({...formData, impact: Number(e.target.value) as any})}
                  >
                    {riskMatrix.impact.map((imp) => (
                      <MenuItem key={imp.value} value={imp.value}>
                        <Box>
                          <Typography variant="body2">{imp.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {imp.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Hesaplanan Risk Seviyesi:</strong>
                  </Typography>
                  {formData.probability && formData.impact && (
                    <Box mt={1}>
                      <Chip
                        label={`${getRiskLevelLabel(calculateRiskLevel(formData.probability, formData.impact).level)} 
                               (Skor: ${calculateRiskLevel(formData.probability, formData.impact).score})`}
                        sx={{
                          backgroundColor: getRiskLevelColor(calculateRiskLevel(formData.probability, formData.impact).level),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  )}
                </Alert>
              </Grid>
            </Grid>
          )}

          {/* Step 2: Önlemler ve Kontroller */}
          {currentStep === 2 && dialogMode !== 'view' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Önlemler ve Kontrol Tedbirleri
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Risk kayıtı oluşturulduktan sonra detaylı önlem ve kontrol planları eklenebilir.
                </Alert>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Belirlenen Kişi"
                  value={formData.identifiedBy || ''}
                  onChange={(e) => setFormData({...formData, identifiedBy: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tanımlama Tarihi"
                  type="date"
                  value={formData.identifiedDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, identifiedDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {/* View Mode Details */}
          {dialogMode === 'view' && selectedRisk && (
            <Box mt={3}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Risk Değerlendirmesi
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Olasılık:</Typography>
                  <Typography variant="body1">{selectedRisk.probability}/5</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Etki:</Typography>
                  <Typography variant="body1">{selectedRisk.impact}/5</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Risk Skoru:</Typography>
                  <Chip
                    label={`${getRiskLevelLabel(selectedRisk.riskLevel)} (${selectedRisk.riskScore})`}
                    sx={{
                      backgroundColor: getRiskLevelColor(selectedRisk.riskLevel),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>
            İptal
          </Button>
          
          {dialogMode !== 'view' && (
            <>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Önceki
                </Button>
              )}
              
              {currentStep < 2 ? (
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 0 && (!formData.title || !formData.description)) ||
                    (currentStep === 1 && (!formData.probability || !formData.impact))
                  }
                >
                  Sonraki
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleSaveRisk}
                  disabled={!formData.title || !formData.description}
                >
                  {dialogMode === 'create' ? 'Risk Ekle' : 'Güncelle'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Risk Matrix Cell Dialog */}
      <Dialog
        open={matrixDialogOpen}
        onClose={() => setMatrixDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon />
            Risk Matrisi Detayları
            {selectedMatrixCell && (
              <Chip
                label={`Olasılık: ${selectedMatrixCell.probability} | Etki: ${selectedMatrixCell.impact}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedMatrixCell && (
            <>
              <Typography variant="h6" gutterBottom>
                Bu hücredeki riskler ({selectedMatrixCell.risks.length} adet)
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Risk ID</TableCell>
                      <TableCell>Başlık</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>Skor</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Sorumlu</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedMatrixCell.risks.map((risk) => (
                      <TableRow key={risk.id}>
                        <TableCell>{risk.riskId}</TableCell>
                        <TableCell>{risk.title}</TableCell>
                        <TableCell>
                          <Chip
                            icon={riskCategories[risk.category].icon}
                            label={riskCategories[risk.category].label}
                            size="small"
                            sx={{ 
                              backgroundColor: riskCategories[risk.category].color + '20',
                              color: riskCategories[risk.category].color
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={risk.riskScore}
                            size="small"
                            sx={{
                              backgroundColor: getRiskLevelColor(risk.riskLevel),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRiskStatusLabel(risk.status)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getRiskStatusColor(risk.status),
                              color: getRiskStatusColor(risk.status)
                            }}
                          />
                        </TableCell>
                        <TableCell>{risk.owner}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Görüntüle">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setMatrixDialogOpen(false);
                                  openViewDialog(risk);
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Düzenle">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setMatrixDialogOpen(false);
                                  openEditDialog(risk);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setMatrixDialogOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RiskManagement;

console.log('Context7 - Risk Yönetimi modülü yüklendi'); 