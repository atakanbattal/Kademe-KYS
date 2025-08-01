import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Chip,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Tooltip,
  Badge,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  DirectionsCar as VehicleIcon,
  Engineering as EngineeringIcon,
  Business as ManagementIcon,
  Verified as QualityIcon,
  GetApp as GetAppIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';

// Interfaces
interface VehicleInfo {
  id: string;
  model: string;
  serialNumber: string;
  chassisNumber?: string;
}

interface DeviationApproval {
  id: string;
  deviationNumber: string;
  partName: string;
  partNumber: string;
  vehicles: VehicleInfo[]; // Birden fazla araç desteki
  deviationType: 'input-control' | 'process-control' | 'final-control';
  description: string;
  reasonForDeviation: string;
  proposedSolution: string;
  qualityRisk: 'low' | 'medium' | 'high' | 'critical';
  requestDate: string;
  requestedBy: string;
  department: string;
  rdApproval: {
    approved: boolean;
    approver: string;
    approvalDate?: string;
    comments?: string;
  };
  qualityApproval: {
    approved: boolean;
    approver: string;
    approvalDate?: string;
    comments?: string;
  };
  productionApproval: {
    approved: boolean;
    approver: string;
    approvalDate?: string;
    comments?: string;
  };
  generalManagerApproval: {
    approved: boolean;
    approver: string;
    approvalDate?: string;
    comments?: string;
  };
  status: 'pending' | 'rd-approved' | 'quality-approved' | 'production-approved' | 'final-approved' | 'rejected';
  rejectionReason?: string; // Reddetme sebebi
  attachments: DeviationAttachment[];
  usageTracking: UsageTracking[];
  createdAt: string;
  updatedAt: string;
}

interface DeviationAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

interface UsageTracking {
  id: string;
  vehicleSerialNumber: string;
  vehicleModel: string;
  customerName: string;
  usageDate: string;
  location: string;
  notes?: string;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Constants
const DEVIATION_TYPES = [
  { value: 'input-control', label: 'Girdi Kontrol' },
  { value: 'process-control', label: 'Proses Kontrol' },
  { value: 'final-control', label: 'Final Kontrol' }
];

const QUALITY_RISKS = [
  { value: 'low', label: 'Düşük', color: 'success' },
  { value: 'medium', label: 'Orta', color: 'warning' },
  { value: 'high', label: 'Yüksek', color: 'error' },
  { value: 'critical', label: 'Kritik', color: 'error' }
];

const DEPARTMENTS = [
  'Ar-Ge',
  'Kalite',
  'Üretim',
  'Satın Alma',
  'Planlama',
  'Sevkiyat',
  'Muhasebe',
  'SSH',
  'ARGE',
  'Montaj',
  'Boyahane',
  'Kaynak',
  'Kesimhane',
  'Malzeme',
  'İnsan Kaynakları',
  'Bilgi İşlem',
  'Pazarlama',
  'Satış'
];

const VEHICLE_TYPES = [
  { value: 'FTH-240', label: 'FTH-240' },
  { value: 'Çelik-2000', label: 'Çelik-2000' },
  { value: 'Aga2100', label: 'Aga2100' },
  { value: 'Aga3000', label: 'Aga3000' },
  { value: 'Aga6000', label: 'Aga6000' },
  { value: 'Kompost Makinesi', label: 'Kompost Makinesi' },
  { value: 'Çay Toplama Makinesi', label: 'Çay Toplama Makinesi' },
  { value: 'KDM 35', label: 'KDM 35' },
  { value: 'KDM 45', label: 'KDM 45' },
  { value: 'KDM 70', label: 'KDM 70' },
  { value: 'KDM 80', label: 'KDM 80' },
  { value: 'Rusya Motor Odası', label: 'Rusya Motor Odası' },
  { value: 'Ural', label: 'Ural' },
  { value: 'HSCK', label: 'HSCK' }
];

const DeviationApprovalManagement: React.FC = () => {
  const { appearanceSettings } = useThemeContext();

  // State Management
  const [deviations, setDeviations] = useState<DeviationApproval[]>([]);
  const [filteredDeviations, setFilteredDeviations] = useState<DeviationApproval[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedDeviation, setSelectedDeviation] = useState<DeviationApproval | null>(null);
  const [formData, setFormData] = useState<Partial<DeviationApproval>>({
    partName: '',
    partNumber: '',
    vehicles: [],
    deviationType: 'input-control',
    description: '',
    reasonForDeviation: '',
    proposedSolution: '',
    qualityRisk: 'low',
    requestDate: new Date().toISOString().split('T')[0],
    requestedBy: '',
    department: '',
    rdApproval: { approved: false, approver: '' },
    qualityApproval: { approved: false, approver: '' },
    productionApproval: { approved: false, approver: '' },
    generalManagerApproval: { approved: false, approver: '' },
    status: 'pending',
    attachments: [],
    usageTracking: []
  });
  
  // Araç ekleme için state
  const [currentVehicle, setCurrentVehicle] = useState<Partial<VehicleInfo>>({
    model: '',
    serialNumber: '',
    chassisNumber: ''
  });
  const [attachmentDialog, setAttachmentDialog] = useState(false);
  const [usageDialog, setUsageDialog] = useState(false);
  const [newUsage, setNewUsage] = useState<Partial<UsageTracking>>({
    vehicleSerialNumber: '',
    vehicleModel: '',
    customerName: '',
    usageDate: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });
  
  // Status change management
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedDeviationForStatus, setSelectedDeviationForStatus] = useState<DeviationApproval | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // ✅ PDF görüntüleme management
  const [pdfViewDialog, setPdfViewDialog] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<DeviationAttachment[]>([]);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);

  // Data Management
  const saveData = useCallback((data: DeviationApproval[]) => {
    try {
      localStorage.setItem('deviationApprovalData', JSON.stringify(data));
      setDeviations(data);
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  }, []);

  const loadData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('deviationApprovalData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setDeviations(parsedData);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtreleme sistemi
  useEffect(() => {
    let filtered = deviations;

    // Arama terimi filtresi
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(deviation => 
        deviation.deviationNumber.toLowerCase().includes(search) ||
        deviation.partName.toLowerCase().includes(search) ||
        deviation.partNumber.toLowerCase().includes(search) ||
        deviation.description.toLowerCase().includes(search) ||
        deviation.requestedBy.toLowerCase().includes(search) ||
        deviation.vehicles.some(vehicle => 
          vehicle.model.toLowerCase().includes(search) ||
          vehicle.serialNumber.toLowerCase().includes(search) ||
          vehicle.chassisNumber?.toLowerCase().includes(search)
        )
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deviation => deviation.status === statusFilter);
    }

    // Departman filtresi
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(deviation => deviation.department === departmentFilter);
    }

    setFilteredDeviations(filtered);
  }, [deviations, searchTerm, statusFilter, departmentFilter]);

  // Helper Functions
  const generateDeviationNumber = () => {
    const currentYear = new Date().getFullYear();
    
    // Son sapma numarasını localStorage'dan al
    const lastDeviationKey = 'lastDeviationNumber';
    const lastDeviationData = localStorage.getItem(lastDeviationKey);
    
    let lastNumber = 0;
    let lastYear = currentYear;
    
    if (lastDeviationData) {
      try {
        const { year, number } = JSON.parse(lastDeviationData);
        lastYear = year;
        // Yıl değişmişse sıfırla, aynı yılsa devam ettir
        if (year === currentYear) {
          lastNumber = number;
        } else {
          console.log(`📅 Yıl değişimi: ${year} → ${currentYear}, numara sıfırlanıyor`);
          lastNumber = 0; // Yeni yılda sıfırla
        }
      } catch (error) {
        console.error('Son sapma numarası okuma hatası:', error);
        lastNumber = 0;
        lastYear = currentYear;
      }
    }
    
    // Yeni numara oluştur - her zaman bir artır
    const newNumber = lastNumber + 1;
    const paddedNumber = String(newNumber).padStart(3, '0');
    
    // localStorage'a kaydet
    localStorage.setItem(lastDeviationKey, JSON.stringify({
      year: currentYear,
      number: newNumber
    }));
    
    console.log(`🔢 Yeni sapma numarası: ${currentYear}-${paddedNumber} (Önceki: ${lastYear}-${String(lastNumber).padStart(3, '0')})`);
    
    return `${currentYear}-${paddedNumber}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'rd-approved': return 'info';
      case 'quality-approved': return 'info';
      case 'production-approved': return 'info';
      case 'final-approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'rd-approved': return 'Ar-Ge Onaylandı';
      case 'quality-approved': return 'Kalite Onaylandı';
      case 'production-approved': return 'Üretim Onaylandı';
      case 'final-approved': return 'Nihai Onay';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  // Araç yönetimi fonksiyonları
  const addVehicle = () => {
    if (!currentVehicle.model || !currentVehicle.serialNumber) {
      alert('Araç modeli ve seri numarası gereklidir!');
      return;
    }

    const newVehicle: VehicleInfo = {
      id: Date.now().toString(),
      model: currentVehicle.model!,
      serialNumber: currentVehicle.serialNumber!,
      chassisNumber: currentVehicle.chassisNumber || ''
    };

    setFormData(prev => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), newVehicle]
    }));

    setCurrentVehicle({
      model: '',
      serialNumber: '',
      chassisNumber: ''
    });
  };

  const removeVehicle = (vehicleId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles?.filter(v => v.id !== vehicleId) || []
    }));
  };

  // Dialog Handlers
  const openCreateDialog = () => {
    setFormData({
      partName: '',
      partNumber: '',
      vehicles: [],
      deviationType: 'input-control',
      description: '',
      reasonForDeviation: '',
      proposedSolution: '',
      qualityRisk: 'low',
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: '',
      department: '',
      rdApproval: { approved: false, approver: '' },
      qualityApproval: { approved: false, approver: '' },
      productionApproval: { approved: false, approver: '' },
      generalManagerApproval: { approved: false, approver: '' },
      status: 'pending',
      attachments: [],
      usageTracking: []
    });
    setCurrentVehicle({
      model: '',
      serialNumber: '',
      chassisNumber: ''
    });
    setDialogMode('create');
    setOpenDialog(true);
  };

  const openEditDialog = (deviation: DeviationApproval) => {
    setSelectedDeviation(deviation);
    setFormData(deviation);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const openViewDialog = (deviation: DeviationApproval) => {
    setSelectedDeviation(deviation);
    setFormData(deviation);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedDeviation(null);
    setDialogMode('create');
  };

  // CRUD Operations
  const handleSubmit = async () => {
    // Validasyon
    if (!formData.partName || !formData.description || !formData.requestedBy) {
      alert('Lütfen gerekli alanları (Parça Adı, Açıklama, Talep Eden) doldurun!');
      return;
    }

    if (!formData.vehicles || formData.vehicles.length === 0) {
      alert('En az bir araç bilgisi eklemelisiniz!');
      return;
    }

    // Araçlarda eksik bilgi kontrolü
    const incompleteVehicles = formData.vehicles.filter(v => !v.model || !v.serialNumber);
    if (incompleteVehicles.length > 0) {
      alert('Tüm araçlar için model ve seri numarası gereklidir!');
      return;
    }

    const now = new Date().toISOString();

    try {
      if (dialogMode === 'create') {
        const newDeviation: DeviationApproval = {
          id: Date.now().toString(),
          deviationNumber: generateDeviationNumber(),
          partName: formData.partName!,
          partNumber: formData.partNumber || '',
          vehicles: formData.vehicles!,
          deviationType: formData.deviationType!,
          description: formData.description!,
          reasonForDeviation: formData.reasonForDeviation || '',
          proposedSolution: formData.proposedSolution || '',
          qualityRisk: formData.qualityRisk!,
          requestDate: formData.requestDate!,
          requestedBy: formData.requestedBy!,
          department: formData.department || '',
          rdApproval: formData.rdApproval!,
          qualityApproval: formData.qualityApproval!,
          productionApproval: formData.productionApproval!,
          generalManagerApproval: formData.generalManagerApproval!,
          status: formData.status!,
          attachments: formData.attachments || [],
          usageTracking: formData.usageTracking || [],
          createdAt: now,
          updatedAt: now
        };

        const updatedDeviations = [...deviations, newDeviation];
        saveData(updatedDeviations);
        console.log('✅ Yeni sapma başarıyla oluşturuldu:', newDeviation.deviationNumber);
      } else if (dialogMode === 'edit' && selectedDeviation) {
        const updatedDeviations = deviations.map(deviation =>
          deviation.id === selectedDeviation.id
            ? { ...deviation, ...formData, updatedAt: now }
            : deviation
        );
        saveData(updatedDeviations);
        console.log('✅ Sapma başarıyla güncellendi:', selectedDeviation.deviationNumber);
      }

      closeDialog();
    } catch (error) {
      console.error('❌ Kaydetme hatası:', error);
      alert('Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDelete = (deviation: DeviationApproval) => {
    if (window.confirm('Bu sapma onayını silmek istediğinizden emin misiniz?')) {
      const updatedDeviations = deviations.filter(d => d.id !== deviation.id);
      saveData(updatedDeviations);
    }
  };

  // Dosya yükleme fonksiyonu - Promise yapısına çevrildi
  const uploadFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        resolve(base64Data);
      };
      reader.onerror = () => {
        reject(new Error('Dosya okuma hatası'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // PDF veya resim dosyası kontrolü
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        alert('Sadece PDF ve resim dosyaları yüklenebilir.');
        return;
      }

      try {
        // Dosyayı base64'e çevir
        const base64Data = await uploadFileToBase64(file);
        
        const newAttachment: DeviationAttachment = {
          id: Date.now().toString(),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          uploadedBy: formData.requestedBy || 'Kullanıcı',
          url: base64Data
        };

        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        }));

        console.log('✅ Dosya başarıyla yüklendi:', file.name, 'Base64 length:', base64Data.length);
      } catch (error) {
        console.error('❌ Dosya yükleme hatası:', error);
        alert('Dosya yükleme sırasında bir hata oluştu.');
      }
    }
    
    // Input'u temizle
    event.target.value = '';
  };

  // Usage Tracking
  const handleAddUsage = () => {
    if (!newUsage.vehicleSerialNumber || !newUsage.vehicleModel) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    const usage: UsageTracking = {
      id: Date.now().toString(),
      vehicleSerialNumber: newUsage.vehicleSerialNumber!,
      vehicleModel: newUsage.vehicleModel!,
      customerName: newUsage.customerName || '',
      usageDate: newUsage.usageDate!,
      location: newUsage.location || '',
      notes: newUsage.notes || ''
    };

    setFormData(prev => ({
      ...prev,
      usageTracking: [...(prev.usageTracking || []), usage]
    }));

    setNewUsage({
      vehicleSerialNumber: '',
      vehicleModel: '',
      customerName: '',
      usageDate: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    });

    setUsageDialog(false);
  };

  // Status Management
  const handleStatusChange = (deviation: DeviationApproval, status: string) => {
    setSelectedDeviationForStatus(deviation);
    setNewStatus(status);
    setRejectionReason('');
    setStatusDialog(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedDeviationForStatus) return;

    if (newStatus === 'rejected' && !rejectionReason.trim()) {
      alert('Reddetme sebebi girmeniz gereklidir!');
      return;
    }

    const updatedDeviations = deviations.map(deviation => {
      if (deviation.id === selectedDeviationForStatus.id) {
        const updatedDeviation = {
          ...deviation,
          status: newStatus as any,
          updatedAt: new Date().toISOString()
        };

        // Reddetme durumunda açıklama ekle
        if (newStatus === 'rejected') {
          updatedDeviation.rejectionReason = rejectionReason;
        }

        return updatedDeviation;
      }
      return deviation;
    });

    saveData(updatedDeviations);
    setStatusDialog(false);
    setSelectedDeviationForStatus(null);
    setNewStatus('');
    setRejectionReason('');
  };

  // ✅ PDF görüntüleme fonksiyonları
  // ✅ YENİ: Equipment Calibration modülündeki gibi PDF görüntüleme
  const handleViewAttachments = (attachments: DeviationAttachment[]) => {
    if (attachments.length === 0) {
      alert('Bu kayıtta görüntülenecek dosya bulunmuyor.');
      return;
    }
    
    // İlk dosyayı görüntüle
    const attachment = attachments[0];
    if (attachment.url) {
      try {
        // Base64 string'den blob oluştur ve yeni sekmede aç
        const byteCharacters = atob(attachment.url.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.fileType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error('❌ PDF görüntüleme hatası:', error);
        alert('PDF görüntülenirken bir hata oluştu.');
      }
    } else {
      alert('Dosya verisi bulunamadı.');
    }
  };

  // ✅ YENİ: Tek dosya görüntüleme fonksiyonu
  const handleViewSingleAttachment = (attachment: DeviationAttachment) => {
    if (attachment.url) {
      try {
        // Base64 string'den blob oluştur ve yeni sekmede aç
        const byteCharacters = atob(attachment.url.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.fileType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error('❌ PDF görüntüleme hatası:', error);
        alert('PDF görüntülenirken bir hata oluştu.');
      }
    } else {
      alert('Dosya verisi bulunamadı.');
    }
  };

  // ✅ YENİ: Dosya indirme fonksiyonu
  const handleDownloadAttachment = (attachment: DeviationAttachment) => {
    if (attachment.url) {
      try {
        // Base64 string'den blob oluştur ve indir
        const byteCharacters = atob(attachment.url.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.fileType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.fileName || 'sapma-dosya.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('❌ Dosya indirme hatası:', error);
        alert('Dosya indirilirken bir hata oluştu.');
      }
    } else {
      alert('Dosya verisi bulunamadı.');
    }
  };

  const handleNextAttachment = () => {
    setSelectedAttachmentIndex(prev => 
      prev < selectedAttachments.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevAttachment = () => {
    setSelectedAttachmentIndex(prev => 
      prev > 0 ? prev - 1 : selectedAttachments.length - 1
    );
  };

  // Statistics
  const stats = useMemo(() => {
    const pending = filteredDeviations.filter(d => d.status === 'pending').length;
    const approved = filteredDeviations.filter(d => d.status === 'final-approved').length;
    const rejected = filteredDeviations.filter(d => d.status === 'rejected').length;
    const inProgress = filteredDeviations.length - pending - approved - rejected;

    return { 
      pending, 
      approved, 
      rejected, 
      inProgress, 
      total: filteredDeviations.length,
      totalInSystem: deviations.length 
    };
  }, [filteredDeviations, deviations]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>


      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Beklemede
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                İnceleme Aşamasında
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Onaylandı
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {stats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reddedildi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          Filtreleme ve Arama
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Sapma no, parça adı, açıklama veya araç bilgisi ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum Filtresi</InputLabel>
              <Select
                value={statusFilter}
                label="Durum Filtresi"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tüm Durumlar</MenuItem>
                <MenuItem value="pending">Beklemede</MenuItem>
                <MenuItem value="rd-approved">Ar-Ge Onaylandı</MenuItem>
                <MenuItem value="quality-approved">Kalite Onaylandı</MenuItem>
                <MenuItem value="production-approved">Üretim Onaylandı</MenuItem>
                <MenuItem value="final-approved">Nihai Onay</MenuItem>
                <MenuItem value="rejected">Reddedildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Departman Filtresi</InputLabel>
              <Select
                value={departmentFilter}
                label="Departman Filtresi"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="all">Tüm Departmanlar</MenuItem>
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
              sx={{ height: 40 }}
            >
              Temizle
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Sonuç: {stats.total} / {stats.totalInSystem} kayıt
          </Typography>
          {searchTerm && (
            <Chip
              label={`Arama: "${searchTerm}"`}
              onDelete={() => setSearchTerm('')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {statusFilter !== 'all' && (
            <Chip
              label={`Durum: ${getStatusLabel(statusFilter)}`}
              onDelete={() => setStatusFilter('all')}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {departmentFilter !== 'all' && (
            <Chip
              label={`Departman: ${departmentFilter}`}
              onDelete={() => setDepartmentFilter('all')}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Sapma Onayları ({stats.total} gösteriliyor / {stats.totalInSystem} toplam)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Yeni Sapma Onayı
        </Button>
      </Box>

      {/* Deviations Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 2, overflow: 'auto', minWidth: 1400 }}>
        <Table size="medium" stickyHeader sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: 'primary.main',
              '& .MuiTableCell-head': {
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 'bold'
              }
            }}>
              <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>Sapma No</TableCell>
              <TableCell sx={{ minWidth: 180, whiteSpace: 'nowrap' }}>Parça Adı</TableCell>
              <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>Parça No</TableCell>
              <TableCell sx={{ minWidth: 200, whiteSpace: 'nowrap' }}>Araçlar</TableCell>
              <TableCell sx={{ minWidth: 160, whiteSpace: 'nowrap' }}>Sapma Tipi</TableCell>
              <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>Kalite Riski</TableCell>
              <TableCell sx={{ minWidth: 150, whiteSpace: 'nowrap' }}>Durum</TableCell>
              <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>Talep Tarihi</TableCell>
              <TableCell sx={{ minWidth: 120, textAlign: 'center', whiteSpace: 'nowrap' }}>Dosyalar</TableCell>
              <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>Kullanım</TableCell>
              <TableCell align="center" sx={{ minWidth: 280, width: 280 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeviations.map((deviation) => (
              <TableRow key={deviation.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {deviation.deviationNumber}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Tooltip title={deviation.partName} arrow>
                    <span>{deviation.partName}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{deviation.partNumber}</TableCell>
                <TableCell sx={{ maxWidth: 200, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {deviation.vehicles && deviation.vehicles.length > 0 ? (
                      deviation.vehicles.map((vehicle, index) => (
                        <Box key={vehicle.id} sx={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 8px', 
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          borderRadius: 1,
                          border: '1px solid rgba(25, 118, 210, 0.2)'
                        }}>
                          <Typography variant="caption" fontWeight="bold" display="block">
                            {vehicle.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            SN: {vehicle.serialNumber}
                          </Typography>
                          {vehicle.chassisNumber && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Şasi: {vehicle.chassisNumber}
                            </Typography>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.disabled" fontStyle="italic">
                        Araç bilgisi yok
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ minWidth: 160, whiteSpace: 'nowrap' }}>
                  <Chip 
                    label={DEVIATION_TYPES.find(t => t.value === deviation.deviationType)?.label}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1, minWidth: 120 }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>
                  <Chip 
                    label={QUALITY_RISKS.find(r => r.value === deviation.qualityRisk)?.label}
                    size="small"
                    color={QUALITY_RISKS.find(r => r.value === deviation.qualityRisk)?.color as any}
                    sx={{ borderRadius: 1, minWidth: 100 }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 150, whiteSpace: 'nowrap' }}>
                  {deviation.status === 'rejected' && deviation.rejectionReason ? (
                    <Tooltip title={`Reddetme Sebebi: ${deviation.rejectionReason}`} arrow>
                      <Chip 
                        label={getStatusLabel(deviation.status)}
                        size="small"
                        color={getStatusColor(deviation.status) as any}
                        sx={{ borderRadius: 1, cursor: 'help' }}
                      />
                    </Tooltip>
                  ) : (
                    <Chip 
                      label={getStatusLabel(deviation.status)}
                      size="small"
                      color={getStatusColor(deviation.status) as any}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {new Date(deviation.requestDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell sx={{ minWidth: 120, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <Tooltip title="Dosyaları Görüntüle">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewAttachments(deviation.attachments)}
                      disabled={deviation.attachments.length === 0}
                    >
                      <Badge badgeContent={deviation.attachments.length} color="primary">
                        <AssignmentIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={deviation.usageTracking?.length || 0} color="secondary">
                      <VehicleIcon />
                    </Badge>
                    {deviation.usageTracking && deviation.usageTracking.length > 0 ? (
                      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', flexGrow: 1 }}>
                        {deviation.usageTracking.map(usage => (
                          <div key={usage.id} style={{ whiteSpace: 'nowrap' }}>
                            SN: {usage.vehicleSerialNumber}
                          </div>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ fontSize: '0.75rem', color: 'text.disabled', fontStyle: 'italic' }}>
                        Henüz kullanım yok
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ width: 250, maxWidth: 250 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 240
                  }}>
                    <Tooltip title="Görüntüle">
                      <IconButton size="small" onClick={() => openViewDialog(deviation)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {deviation.status !== 'final-approved' && deviation.status !== 'rejected' && (
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => openEditDialog(deviation)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {deviation.status !== 'final-approved' && deviation.status !== 'rejected' && (
                      <>
                        <Tooltip title="Onayla">
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleStatusChange(deviation, 'final-approved')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reddet">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleStatusChange(deviation, 'rejected')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Sil">
                      <IconButton size="small" color="error" onClick={() => handleDelete(deviation)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredDeviations.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {deviations.length === 0 
                      ? 'Henüz sapma onayı kaydı bulunmuyor' 
                      : 'Filtreleme kriterlerine uygun kayıt bulunamadı'
                    }
                  </Typography>
                  {deviations.length > 0 && filteredDeviations.length === 0 && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setDepartmentFilter('all');
                      }}
                    >
                      Filtreleri Temizle
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Main Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={closeDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          {dialogMode === 'create' && 'Yeni Sapma Onayı Oluştur'}
          {dialogMode === 'edit' && 'Sapma Onayını Düzenle'}
          {dialogMode === 'view' && 'Sapma Onayı Detayları'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                Temel Bilgiler
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parça Adı *"
                value={formData.partName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parça Numarası"
                value={formData.partNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            {/* Araç Bilgileri Bölümü */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 2 }}>
                Araç Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Araç Ekleme Formu */}
            {dialogMode !== 'view' && (
              <>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Araç Modeli</InputLabel>
                    <Select
                      value={currentVehicle.model || ''}
                      label="Araç Modeli"
                      onChange={(e) => setCurrentVehicle(prev => ({ ...prev, model: e.target.value }))}
                    >
                      {VEHICLE_TYPES.map((vehicle) => (
                        <MenuItem key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Araç Seri Numarası"
                    value={currentVehicle.serialNumber || ''}
                    onChange={(e) => setCurrentVehicle(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Şasi Numarası (Opsiyonel)"
                    value={currentVehicle.chassisNumber || ''}
                    onChange={(e) => setCurrentVehicle(prev => ({ ...prev, chassisNumber: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addVehicle}
                    sx={{ height: 56 }}
                    disabled={!currentVehicle.model || !currentVehicle.serialNumber}
                  >
                    Ekle
                  </Button>
                </Grid>
              </>
            )}

            {/* Eklenen Araçlar Listesi */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Eklenen Araçlar ({formData.vehicles?.length || 0} adet)
                </Typography>
                {formData.vehicles && formData.vehicles.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {formData.vehicles.map((vehicle) => (
                      <Box key={vehicle.id} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 2, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1,
                        backgroundColor: '#f9f9f9'
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {vehicle.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SN: {vehicle.serialNumber}
                            {vehicle.chassisNumber && ` | Şasi: ${vehicle.chassisNumber}`}
                          </Typography>
                        </Box>
                        {dialogMode !== 'view' && (
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => removeVehicle(vehicle.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    En az bir araç bilgisi eklemelisiniz
                  </Alert>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sapma Tipi *</InputLabel>
                <Select
                  value={formData.deviationType || 'input-control'}
                  label="Sapma Tipi *"
                  onChange={(e) => setFormData(prev => ({ ...prev, deviationType: e.target.value as any }))}
                  disabled={dialogMode === 'view'}
                >
                  {DEVIATION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kalite Riski *</InputLabel>
                <Select
                  value={formData.qualityRisk || 'low'}
                  label="Kalite Riski *"
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityRisk: e.target.value as any }))}
                  disabled={dialogMode === 'view'}
                >
                  {QUALITY_RISKS.map((risk) => (
                    <MenuItem key={risk.value} value={risk.value}>
                      {risk.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Sapma Açıklaması *"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Sapma Sebebi"
                value={formData.reasonForDeviation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, reasonForDeviation: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Önerilen Çözüm"
                value={formData.proposedSolution || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, proposedSolution: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            {/* Request Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 2 }}>
                Talep Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Talep Tarihi *"
                value={formData.requestDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, requestDate: e.target.value }))}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Talep Eden *"
                value={formData.requestedBy || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={formData.department || ''}
                  label="Departman"
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  disabled={dialogMode === 'view'}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ✅ YENİ: Reddetme sebebi gösterimi */}
            {dialogMode === 'view' && formData.status === 'rejected' && formData.rejectionReason && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ❌ Reddetme Sebebi
                  </Typography>
                  <Typography variant="body1">
                    {formData.rejectionReason}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Attachments */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 2 }}>
                Dosya Ekleri
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                {dialogMode !== 'view' && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Dosya Yükle
                    <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                  </Button>
                )}
                <Typography variant="body2" color="text.secondary">
                  {formData.attachments?.length || 0} dosya eklendi
                </Typography>
              </Box>

              {formData.attachments && formData.attachments.length > 0 && (
                <Box>
                  {formData.attachments.map((attachment) => (
                    <Box key={attachment.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={`${attachment.fileName} (${(attachment.fileSize / 1024).toFixed(1)} KB)`}
                        variant="outlined"
                        sx={{ flex: 1, justifyContent: 'flex-start' }}
                        onDelete={dialogMode !== 'view' ? () => {
                          setFormData(prev => ({
                            ...prev,
                            attachments: prev.attachments?.filter(a => a.id !== attachment.id) || []
                          }));
                        } : undefined}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewSingleAttachment(attachment)}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Görüntüle
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadAttachment(attachment)}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        İndir
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Usage Tracking */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 2 }}>
                Kullanım Takibi
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                {dialogMode !== 'view' && (
                  <Button
                    variant="outlined"
                    startIcon={<VehicleIcon />}
                    onClick={() => setUsageDialog(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Kullanım Ekle
                  </Button>
                )}
                <Typography variant="body2" color="text.secondary">
                  {formData.usageTracking?.length || 0} kullanım kaydı
                </Typography>
              </Box>

              {formData.usageTracking && formData.usageTracking.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Araç Seri No</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Müşteri</TableCell>
                        <TableCell>Kullanım Tarihi</TableCell>
                        <TableCell>Lokasyon</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.usageTracking.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell>{usage.vehicleSerialNumber}</TableCell>
                          <TableCell>{usage.vehicleModel}</TableCell>
                          <TableCell>{usage.customerName}</TableCell>
                          <TableCell>{new Date(usage.usageDate).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>{usage.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog}>
            İptal
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'create' ? 'Oluştur' : 'Güncelle'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Usage Tracking Dialog */}
      <Dialog 
        open={usageDialog} 
        onClose={() => setUsageDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Kullanım Takibi Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Araç Seri Numarası *"
                value={newUsage.vehicleSerialNumber || ''}
                onChange={(e) => setNewUsage(prev => ({ ...prev, vehicleSerialNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Araç Modeli *"
                value={newUsage.vehicleModel || ''}
                onChange={(e) => setNewUsage(prev => ({ ...prev, vehicleModel: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Müşteri Adı"
                value={newUsage.customerName || ''}
                onChange={(e) => setNewUsage(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Kullanım Tarihi *"
                value={newUsage.usageDate || ''}
                onChange={(e) => setNewUsage(prev => ({ ...prev, usageDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lokasyon"
                value={newUsage.location || ''}
                onChange={(e) => setNewUsage(prev => ({ ...prev, location: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notlar"
                value={newUsage.notes || ''}
                onChange={(e) => setNewUsage(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageDialog(false)}>
            İptal
          </Button>
          <Button onClick={handleAddUsage} variant="contained">
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Durum Değiştir
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Sapma No:</strong> {selectedDeviationForStatus?.deviationNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Parça Adı:</strong> {selectedDeviationForStatus?.partName}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              <strong>Yeni Durum:</strong> {newStatus === 'final-approved' ? 'Onaylandı' : 'Reddedildi'}
            </Typography>

            {newStatus === 'rejected' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reddetme Sebebi *"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Lütfen reddetme sebebini açıklayın..."
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>
            İptal
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ PDF Görüntüleme Dialog */}
      <Dialog 
        open={pdfViewDialog} 
        onClose={() => setPdfViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Dosya Görüntüleme</span>
          {selectedAttachments.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handlePrevAttachment}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                ◀ Önceki
              </Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                {selectedAttachmentIndex + 1} / {selectedAttachments.length}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleNextAttachment}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Sonraki ▶
              </Button>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedAttachments.length > 0 && (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" sx={{ 
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  📎 {selectedAttachments[selectedAttachmentIndex]?.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Dosya Boyutu: {Math.round((selectedAttachments[selectedAttachmentIndex]?.fileSize || 0) / 1024)} KB
                  {' | '}
                  Yüklenme Tarihi: {new Date(selectedAttachments[selectedAttachmentIndex]?.uploadDate || '').toLocaleDateString('tr-TR')}
                  {' | '}
                  Yükleyen: {selectedAttachments[selectedAttachmentIndex]?.uploadedBy}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                {selectedAttachments[selectedAttachmentIndex]?.fileType === 'application/pdf' ? (
                  <Box sx={{ width: '100%', height: '100%', border: '1px solid #e0e0e0', borderRadius: 1, position: 'relative' }}>
                    {selectedAttachments[selectedAttachmentIndex]?.url ? (
                      <iframe
                        src={selectedAttachments[selectedAttachmentIndex]?.url}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', borderRadius: '4px' }}
                        title={selectedAttachments[selectedAttachmentIndex]?.fileName}
                      />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        gap: 2
                      }}>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                          📄 PDF Dosyası
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          {selectedAttachments[selectedAttachmentIndex]?.fileName}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'warning.main', fontStyle: 'italic' }}>
                          ⚠️ PDF URL'i mevcut değil
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>📄 Dosya</Typography>
                    <Typography variant="body1" sx={{ mb: 1, wordBreak: 'break-word' }}>
                      {selectedAttachments[selectedAttachmentIndex]?.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dosya Türü: {selectedAttachments[selectedAttachmentIndex]?.fileType}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfViewDialog(false)}>
            Kapat
          </Button>
          {selectedAttachments[selectedAttachmentIndex] && (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Dosya indirme işlemi - gelecekte implement edilecek
                alert('Dosya indirme özelliği geliştirme aşamasındadır.');
              }}
            >
              İndir
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeviationApprovalManagement;