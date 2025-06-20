// ✅ KADEME A.Ş. - Kalite Yönetim Sistemi
// ✅ Context7 - TrainingManagement.tsx

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Avatar, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// ✅ Enhanced Training Interface Definitions
interface TrainingMaterial {
  id: string;
  name: string;
  type: 'presentation' | 'document' | 'video' | 'handout' | 'certificate';
  url?: string;
  uploadDate: string;
}

interface TrainingRecord {
  id: string;
  title: string;
  description: string;
  category: 'Zorunlu' | 'İsteğe Bağlı' | 'Sertifika' | 'Yenileme' | 'Özel';
  type: 'Teknik' | 'Güvenlik' | 'Kalite' | 'Yönetim' | 'Operasyonel' | 'İnsan Kaynakları' | 'Empati' | 'İletişim' | 'Liderlik' | 'Satış' | 'Müşteri Hizmetleri' | 'Finansal' | 'Pazarlama' | 'Teknoloji' | 'Çevre';
  status: 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal' | 'Ertelendi';
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  department: string;
  trainer: string;
  participants: string[]; // Katılımcı isimleri
  plannedDate: string;
  startDate?: string;
  endDate?: string;
  duration: number; // saat
  venue: string;
  maxParticipants: number;
  budget: number;
  objectives: string;
  content: string;
  materials: TrainingMaterial[];
  evaluationMethod: string;
  certificateRequired: boolean;
  prerequisites: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

// Training dialog mode type explicitly - forced to string to avoid TS error 
type DialogMode = string;

const TrainingManagement: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<TrainingRecord>>({});
  const [selectedTraining, setSelectedTraining] = useState<TrainingRecord | null>(null);
  const [viewMode, setViewMode] = useState<DialogMode>('create');
  const [participantInput, setParticipantInput] = useState('');
  const [materialType, setMaterialType] = useState<TrainingMaterial['type']>('presentation');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sample data initialization
  useEffect(() => {
    const savedTrainings = localStorage.getItem('training-records');
    if (!savedTrainings) {
      const sampleTrainings: TrainingRecord[] = [
        {
          id: '1',
          title: 'ISO 9001:2015 Kalite Yönetim Sistemi Eğitimi',
          description: 'ISO 9001:2015 standardının gereklilikleri ve uygulama prensipleri',
          category: 'Zorunlu',
          type: 'Kalite',
          status: 'Tamamlandı',
          priority: 'Yüksek',
          department: 'Tüm Departmanlar',
          trainer: 'Ahmet Yılmaz (Kalite Müdürü)',
          participants: ['Mehmet Demir', 'Ayşe Kaya', 'Fatma Özkan', 'Hasan Çelik'],
          plannedDate: '2024-02-15',
          startDate: '2024-02-15',
          endDate: '2024-02-16',
          duration: 16,
          venue: 'Konferans Salonu',
          maxParticipants: 25,
          budget: 15000,
          objectives: 'ISO 9001:2015 gerekliliklerini anlamak ve uygulamak',
          content: 'Kalite yönetim prensipleri, süreç yaklaşımı, risk bazlı düşünce',
          materials: [
            { id: '1', name: 'ISO 9001 Sunum.pptx', type: 'presentation', uploadDate: '2024-02-10' },
            { id: '2', name: 'Kalite El Kitabı.pdf', type: 'document', uploadDate: '2024-02-10' }
          ],
          evaluationMethod: 'Yazılı sınav ve vaka çalışması',
          certificateRequired: true,
          prerequisites: 'Temel kalite bilgisi',
          createdBy: 'Sistem Yöneticisi',
          createdDate: '2024-01-10',
          lastModified: '2024-02-20'
        },
        {
          id: '2',
          title: 'Empati ve İletişim Becerileri Geliştirme',
          description: 'Çalışanlar arası empati kurma ve etkili iletişim teknikleri',
          category: 'İsteğe Bağlı',
          type: 'İnsan Kaynakları',
          status: 'Planlandı',
          priority: 'Orta',
          department: 'İnsan Kaynakları',
          trainer: 'Dr. Elif Yıldız (Psikolog)',
          participants: [],
          plannedDate: '2024-06-20',
          duration: 8,
          venue: 'Eğitim Salonu',
          maxParticipants: 20,
          budget: 8000,
          objectives: 'Empati becerileri geliştirmek ve etkili iletişim kurmak',
          content: 'Empati teknikleri, aktif dinleme, çatışma yönetimi',
          materials: [],
          evaluationMethod: 'Rol oyunları ve gözlem',
          certificateRequired: false,
          prerequisites: 'Herhangi bir ön koşul yok',
          createdBy: 'İnsan Kaynakları',
          createdDate: '2024-05-15',
          lastModified: '2024-05-15'
        }
      ];
      setTrainings(sampleTrainings);
      localStorage.setItem('training-records', JSON.stringify(sampleTrainings));
    } else {
      const loadedTrainings = JSON.parse(savedTrainings);
      // Eski verilerin participants array'i olmayabilir, o yüzden default değer ekliyoruz
      const migratedTrainings = loadedTrainings.map((training: any) => ({
        ...training,
        participants: training.participants || [],
        materials: training.materials || []
      }));
      setTrainings(migratedTrainings);
    }
  }, []);

  const saveToLocalStorage = (updatedTrainings: TrainingRecord[]) => {
    localStorage.setItem('training-records', JSON.stringify(updatedTrainings));
  };

  const stats = {
    total: trainings.length,
    planned: trainings.filter(t => t.status === 'Planlandı').length,
    completed: trainings.filter(t => t.status === 'Tamamlandı').length,
    inProgress: trainings.filter(t => t.status === 'Devam Ediyor').length,
    completionRate: trainings.length > 0 ? 
      (trainings.filter(t => t.status === 'Tamamlandı').length / trainings.length * 100) : 0
  };

  // ✅ Event Handlers
  const handleCreateTraining = () => {
    setViewMode('create');
    setFormData({
      title: '',
      description: '',
      category: 'Zorunlu',
      type: 'Kalite',
      status: 'Planlandı',
      priority: 'Orta',
      department: '',
      trainer: '',
      participants: [],
      plannedDate: '',
      duration: 8,
      venue: '',
      maxParticipants: 20,
      budget: 0,
      objectives: '',
      content: '',
      materials: [],
      evaluationMethod: '',
      certificateRequired: false,
      prerequisites: ''
    });
    setActiveStep(0);
    setDialogOpen(true);
  };

  const handleEditTraining = (training: TrainingRecord) => {
    setViewMode('edit');
    setSelectedTraining(training);
    setFormData(training);
    setActiveStep(0);
    setDialogOpen(true);
  };

  const handleViewTraining = (training: TrainingRecord) => {
    setViewMode('view');
    setSelectedTraining(training);
    setFormData(training);
    setActiveStep(0);
    setDialogOpen(true);
  };

  const handleDeleteTraining = (trainingId: string) => {
    // Eğitim silme onayı kaldırıldı - sessiz silme
    if (true) {
      const updatedTrainings = trainings.filter(t => t.id !== trainingId);
      setTrainings(updatedTrainings);
      saveToLocalStorage(updatedTrainings);
    }
  };

  const handleSaveTraining = () => {
    if (!formData.title || !formData.description || !formData.trainer) return;

    const newTraining: TrainingRecord = {
      id: viewMode === 'create' ? Date.now().toString() : selectedTraining!.id,
      title: formData.title!,
      description: formData.description!,
      category: formData.category!,
      type: formData.type!,
      status: formData.status!,
      priority: formData.priority!,
      department: formData.department!,
      trainer: formData.trainer!,
      participants: formData.participants || [],
      plannedDate: formData.plannedDate!,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration!,
      venue: formData.venue!,
      maxParticipants: formData.maxParticipants!,
      budget: formData.budget!,
      objectives: formData.objectives!,
      content: formData.content!,
      materials: formData.materials || [],
      evaluationMethod: formData.evaluationMethod!,
      certificateRequired: formData.certificateRequired!,
      prerequisites: formData.prerequisites!,
      createdBy: formData.createdBy || 'Kullanıcı',
      createdDate: formData.createdDate || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    let updatedTrainings;
    if (viewMode === 'create') {
      updatedTrainings = [...trainings, newTraining];
    } else {
      updatedTrainings = trainings.map(t => t.id === newTraining.id ? newTraining : t);
    }

    setTrainings(updatedTrainings);
    saveToLocalStorage(updatedTrainings);
    setDialogOpen(false);
    setFormData({});
    setActiveStep(0);
  };

  const addParticipant = () => {
    if (participantInput.trim() && formData.participants) {
      const updatedParticipants = [...formData.participants, participantInput.trim()];
      setFormData({ ...formData, participants: updatedParticipants });
      setParticipantInput('');
    }
  };

  const removeParticipant = (index: number) => {
    if (formData.participants) {
      const updatedParticipants = formData.participants.filter((_, i) => i !== index);
      setFormData({ ...formData, participants: updatedParticipants });
    }
  };

  const addMaterial = () => {
    if (selectedFile) {
      const newMaterial: TrainingMaterial = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: materialType,
        url: URL.createObjectURL(selectedFile), // Gerçek uygulamada server'a upload edilir
        uploadDate: new Date().toISOString()
      };
      const updatedMaterials = [...(formData.materials || []), newMaterial];
      setFormData({ ...formData, materials: updatedMaterials });
      setSelectedFile(null);
  
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

    }
  };

  const removeMaterial = (materialId: string) => {
    if (formData.materials) {
      const updatedMaterials = formData.materials.filter(m => m.id !== materialId);
      setFormData({ ...formData, materials: updatedMaterials });
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'Tamamlandı': return 'success';
      case 'Devam Ediyor': return 'info';
      case 'Planlandı': return 'primary';
      case 'İptal': return 'error';
      case 'Ertelendi': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (category) {
      case 'Zorunlu': return 'error';
      case 'Sertifika': return 'success';
      case 'Yenileme': return 'warning';
      default: return 'info';
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0: return !!(formData.title && formData.description && formData.category && formData.type);
      case 1: return !!(formData.department && formData.trainer && formData.plannedDate && formData.venue);
      case 2: return !!(formData.objectives && formData.content && formData.evaluationMethod);
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const trainingTypeOptions = [
    'Teknik', 'Güvenlik', 'Kalite', 'Yönetim', 'Operasyonel', 
    'İnsan Kaynakları', 'Empati', 'İletişim', 'Liderlik', 'Satış', 
    'Müşteri Hizmetleri', 'Finansal', 'Pazarlama', 'Teknoloji', 'Çevre'
  ];

  const materialTypeOptions = [
    { value: 'presentation', label: 'Sunum' },
    { value: 'document', label: 'Doküman' },
    { value: 'video', label: 'Video' },
    { value: 'handout', label: 'El Kitabı' },
    { value: 'certificate', label: 'Sertifika' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Eğitim Yönetimi</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateTraining}
          size="large"
        >
          Yeni Eğitim Planla
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Eğitim
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.planned}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Planlanmış
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CompleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.completed}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamamlanan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.completionRate.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamamlanma Oranı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Eğitim Kayıtları</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Eğitim Başlığı</strong></TableCell>
                  <TableCell><strong>Kategori</strong></TableCell>
                  <TableCell><strong>Eğitim Türü</strong></TableCell>
                  <TableCell><strong>Durum</strong></TableCell>
                  <TableCell><strong>Katılımcı Sayısı</strong></TableCell>
                  <TableCell><strong>Planlanan Tarih</strong></TableCell>
                  <TableCell><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{training.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {training.trainer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={training.category} 
                        color={getCategoryColor(training.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={training.type} 
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={training.status} 
                        color={getStatusColor(training.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {(training.participants?.length || 0)}/{training.maxParticipants}
                    </TableCell>
                    <TableCell>{new Date(training.plannedDate).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton size="small" color="primary" onClick={() => handleViewTraining(training)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton size="small" color="info" onClick={() => handleEditTraining(training)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton size="small" color="error" onClick={() => handleDeleteTraining(training.id)}>
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
      </Card>

      {/* ✅ Enhanced Professional Training Planning Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            {viewMode === 'create' ? 'Yeni Eğitim Planla' : 
             viewMode === 'edit' ? 'Eğitim Düzenle' : 'Eğitim Görüntüle'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {viewMode === 'view' ? (
              // ✅ View Mode - Compact Display
              <Box>
                <Grid container spacing={3}>
                  {/* Temel Bilgiler */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>Temel Bilgiler</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Eğitim Başlığı</Typography>
                        <Typography variant="body1">{formData.title || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Kategori</Typography>
                        <Chip label={formData.category || '-'} color={getCategoryColor(formData.category || '')} size="small" />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Eğitim Türü</Typography>
                        <Typography variant="body1">{formData.type || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                        <Chip label={formData.status || '-'} color={getStatusColor(formData.status || '')} size="small" />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
                        <Typography variant="body1">{formData.description || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Organizasyon Bilgileri */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>Organizasyon Bilgileri</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Departman</Typography>
                        <Typography variant="body1">{formData.department || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Eğitmen</Typography>
                        <Typography variant="body1">{formData.trainer || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Planlanan Tarih</Typography>
                        <Typography variant="body1">{formData.plannedDate ? new Date(formData.plannedDate).toLocaleDateString('tr-TR') : '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Süre</Typography>
                        <Typography variant="body1">{formData.duration ? `${formData.duration} saat` : '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Yer/Mekan</Typography>
                        <Typography variant="body1">{formData.venue || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Maksimum Katılımcı</Typography>
                        <Typography variant="body1">{formData.maxParticipants || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Katılımcılar */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>Katılımcılar ({(formData.participants?.length || 0)} kişi)</Typography>
                    {formData.participants && formData.participants.length > 0 ? (
                      <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                        <Grid container spacing={1}>
                          {formData.participants.map((participant, index) => (
                            <Grid item xs={6} key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon fontSize="small" color="primary" />
                                <Typography variant="body2">{participant}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Henüz katılımcı eklenmemiş
                      </Typography>
                    )}
                  </Grid>

                  {/* İçerik ve Hedefler */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>İçerik ve Hedefler</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Eğitim Hedefleri</Typography>
                        <Typography variant="body1">{formData.objectives || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Eğitim İçeriği</Typography>
                        <Typography variant="body1">{formData.content || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Değerlendirme Yöntemi</Typography>
                        <Typography variant="body1">{formData.evaluationMethod || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Sertifika Gerekli</Typography>
                        <Chip 
                          label={formData.certificateRequired ? 'Evet' : 'Hayır'} 
                          color={formData.certificateRequired ? 'success' : 'default'} 
                          size="small" 
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Materyaller */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>Eğitim Materyalleri</Typography>
                    {formData.materials && formData.materials.length > 0 ? (
                      <Paper variant="outlined" sx={{ p: 1 }}>
                        <List dense>
                          {formData.materials.map((material) => (
                            <ListItem key={material.id}>
                              <AttachFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <ListItemText 
                                primary={material.name}
                                secondary={`${materialTypeOptions.find(t => t.value === material.type)?.label} - ${new Date(material.uploadDate).toLocaleDateString('tr-TR')}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Henüz materyal eklenmemiş
                      </Typography>
                    )}
                  </Grid>

                  {/* Diğer Bilgiler */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>Diğer Bilgiler</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Bütçe</Typography>
                        <Typography variant="body1">{formData.budget ? `${formData.budget.toLocaleString('tr-TR')} ₺` : '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Öncelik</Typography>
                        <Typography variant="body1">{formData.priority || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Ön Koşullar</Typography>
                        <Typography variant="body1">{formData.prerequisites || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              // ✅ Create/Edit Mode - Stepper Form
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              <Stepper activeStep={activeStep} orientation="vertical">
              
              {/* Step 1: Temel Bilgiler */}
              <Step>
                <StepLabel icon={<AssignmentIcon />}>Temel Eğitim Bilgileri</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Eğitim Başlığı"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Açıklama"
                        multiline
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Kategori</InputLabel>
                        <Select
                          value={formData.category || 'Zorunlu'}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          disabled={viewMode === 'view'}
                        >
                          {['Zorunlu', 'İsteğe Bağlı', 'Sertifika', 'Yenileme', 'Özel'].map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Eğitim Türü</InputLabel>
                        <Select
                          value={formData.type || 'Kalite'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                          disabled={viewMode === 'view'}
                        >
                          {trainingTypeOptions.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Öncelik</InputLabel>
                        <Select
                          value={formData.priority || 'Orta'}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          disabled={viewMode === 'view'}
                        >
                          {['Düşük', 'Orta', 'Yüksek', 'Kritik'].map(priority => (
                            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Durum</InputLabel>
                        <Select
                          value={formData.status || 'Planlandı'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          disabled={viewMode === 'view'}
                        >
                          {['Planlandı', 'Devam Ediyor', 'Tamamlandı', 'İptal', 'Ertelendi'].map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!validateStep(0) || viewMode === 'view'}
                    >
                      Sonraki
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Organizasyon ve Katılımcılar */}
              <Step>
                <StepLabel icon={<GroupIcon />}>Organizasyon ve Katılımcılar</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Departman"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Eğitmen"
                        value={formData.trainer || ''}
                        onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Planlanan Tarih"
                        type="date"
                        value={formData.plannedDate || ''}
                        onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Süre (Saat)"
                        type="number"
                        value={formData.duration || 8}
                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Yer/Mekan"
                        value={formData.venue || ''}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Maksimum Katılımcı"
                        type="number"
                        value={formData.maxParticipants || 20}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bütçe (₺)"
                        type="number"
                        value={formData.budget || 0}
                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    
                    {/* Katılımcı Ekleme Bölümü */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Katılımcılar</Typography>
                      {viewMode !== 'view' && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Katılımcı Adı Soyadı"
                            value={participantInput}
                            onChange={(e) => setParticipantInput(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon />
                                </InputAdornment>
                              ),
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                          />
                          <Button variant="contained" onClick={addParticipant} startIcon={<AddIcon />}>
                            Ekle
                          </Button>
                        </Box>
                      )}
                      
                      {formData.participants && formData.participants.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                          <List dense>
                            {formData.participants.map((participant, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={participant} />
                                {viewMode !== 'view' && (
                                  <ListItemSecondaryAction>
                                    <IconButton 
                                      edge="end" 
                                      size="small" 
                                      onClick={() => removeParticipant(index)}
                                      color="error"
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                )}
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )}
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button onClick={handleBack}>Önceki</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!validateStep(1) || viewMode === 'view'}
                    >
                      Sonraki
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: İçerik ve Materyaller */}
              <Step>
                <StepLabel icon={<CheckIcon />}>İçerik ve Değerlendirme</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Eğitim Hedefleri"
                        multiline
                        rows={3}
                        value={formData.objectives || ''}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Eğitim İçeriği"
                        multiline
                        rows={3}
                        value={formData.content || ''}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>

                    {/* Eğitim Materyalleri Bölümü */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Eğitim Materyalleri</Typography>
                      {viewMode !== 'view' && (
                        <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            Eğitim için gerekli dosyaları yükleyin
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<AttachFileIcon />}
                              sx={{ minWidth: 140 }}
                            >
                              Dosya Seç
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.avi,.mov"
                                onChange={handleFileSelect}
                              />
                            </Button>
                            <TextField
                              label="Seçilen Dosya"
                              value={selectedFile?.name || ''}
                              InputProps={{ readOnly: true }}
                              sx={{ flex: 1 }}
                              size="small"
                            />
                            <FormControl sx={{ minWidth: 120 }}>
                              <InputLabel size="small">Materyal Türü</InputLabel>
                              <Select
                                value={materialType}
                                onChange={(e) => setMaterialType(e.target.value as any)}
                                size="small"
                              >
                                {materialTypeOptions.map(option => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button 
                              variant="contained" 
                              onClick={addMaterial} 
                              startIcon={<UploadIcon />}
                              disabled={!selectedFile}
                              color="success"
                            >
                              Yükle
                            </Button>
                          </Box>
                        </Card>
                      )}
                      
                      {formData.materials && formData.materials.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Yüklenen Materyaller ({formData.materials.length})
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
                            <List dense>
                              {formData.materials.map((material, index) => (
                                <ListItem 
                                  key={material.id}
                                  sx={{ 
                                    border: 1, 
                                    borderColor: 'divider', 
                                    borderRadius: 1, 
                                    mb: 1,
                                    bgcolor: 'background.paper'
                                  }}
                                >
                                  <AttachFileIcon sx={{ mr: 2, color: 'primary.main' }} />
                                  <ListItemText 
                                    primary={
                                      <Typography variant="body2" fontWeight="medium">
                                        {material.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                        <Chip 
                                          label={materialTypeOptions.find(t => t.value === material.type)?.label}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(material.uploadDate).toLocaleDateString('tr-TR')}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                  {viewMode !== 'view' && (
                                    <ListItemSecondaryAction>
                                      <Tooltip title="Dosyayı Sil">
                                        <IconButton 
                                          edge="end" 
                                          size="small" 
                                          onClick={() => removeMaterial(material.id)}
                                          color="error"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </ListItemSecondaryAction>
                                  )}
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        </>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Değerlendirme Yöntemi"
                        value={formData.evaluationMethod || ''}
                        onChange={(e) => setFormData({ ...formData, evaluationMethod: e.target.value })}
                        required
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ön Koşullar"
                        multiline
                        rows={2}
                        value={formData.prerequisites || ''}
                        onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                        disabled={viewMode === 'view'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.certificateRequired || false}
                            onChange={(e) => setFormData({ ...formData, certificateRequired: e.target.checked })}
                            disabled={viewMode === 'view'}
                          />
                        }
                        label="Sertifika Gerekli"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button onClick={handleBack}>Önceki</Button>
                    {viewMode !== 'view' && (
                      <Button
                        variant="contained"
                        onClick={handleSaveTraining}
                        disabled={!validateStep(2)}
                        color="success"
                      >
                        Eğitimi Kaydet
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {viewMode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingManagement; 