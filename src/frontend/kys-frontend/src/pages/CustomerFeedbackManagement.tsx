// ✅ KADEME A.Ş. - Kalite Yönetim Sistemi
// ✅ Context7 - CustomerFeedbackManagement.tsx
// ✅ Enterprise-grade Customer Feedback Management System

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Rating,
  Divider,
  Avatar,
  Tab,
  Tabs
} from '@mui/material';

import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// ✅ Context7 - INTERFACES
interface CustomerFeedback {
  id: string;
  feedbackId: string;
  customerName: string;
  customerType: 'individual' | 'corporate';
  companyName?: string;
  contactEmail: string;
  contactPhone?: string;
  feedbackType: 'complaint' | 'suggestion' | 'compliment' | 'inquiry' | 'quality_issue' | 'service_issue';
  category: 'product_quality' | 'service_quality' | 'delivery' | 'pricing' | 'support' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  description: string;
  rating?: number; // 1-5 stars
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  assignedTo?: string;
  department: string;
  source: 'website' | 'email' | 'phone' | 'social_media' | 'survey' | 'in_person';
  attachments?: string[];
  responseMessage?: string;
  responseDate?: string;
  respondedBy?: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  satisfactionRating?: number;
  followUpRequired: boolean;
  followUpDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const CustomerFeedbackManagement: React.FC = () => {
  // ✅ State Management
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | 'respond'>('create');
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  // ✅ Form State
  const [formData, setFormData] = useState<Partial<CustomerFeedback>>({
    customerName: '',
    customerType: 'individual',
    contactEmail: '',
    contactPhone: '',
    feedbackType: 'suggestion',
    category: 'general',
    priority: 'medium',
    subject: '',
    description: '',
    rating: 5,
    department: 'Kalite',
    source: 'website',
    followUpRequired: false,
    tags: []
  });

  // ✅ Context7 - Data Loading
  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = () => {
    try {
      const stored = localStorage.getItem('customer-feedbacks');
      if (stored) {
        setFeedbacks(JSON.parse(stored));
      } else {
        // Initialize with sample data
        const sampleData: CustomerFeedback[] = [
          {
            id: 'fb_1',
            feedbackId: 'FB-2024-0001',
            customerName: 'Ahmet Yılmaz',
            customerType: 'individual',
            contactEmail: 'ahmet@email.com',
            feedbackType: 'complaint',
            category: 'product_quality',
            priority: 'high',
            subject: 'Ürün kalite sorunu',
            description: 'Satın aldığım üründe kalite sorunu var',
            rating: 2,
            status: 'open',
            department: 'Kalite',
            source: 'website',
            followUpRequired: true,
            tags: ['kalite', 'ürün'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'fb_2',
            feedbackId: 'FB-2024-0002',
            customerName: 'Fatma Demir',
            customerType: 'corporate',
            companyName: 'ABC Şirketi',
            contactEmail: 'fatma@abc.com',
            feedbackType: 'suggestion',
            category: 'service_quality',
            priority: 'medium',
            subject: 'Hizmet iyileştirme önerisi',
            description: 'Müşteri hizmetleri daha hızlı olabilir',
            rating: 4,
            status: 'in_progress',
            department: 'Müşteri Hizmetleri',
            source: 'email',
            followUpRequired: false,
            tags: ['hizmet', 'öneri'],
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
            updatedAt: new Date().toISOString()
          },
          {
            id: 'fb_3',
            feedbackId: 'FB-2024-0003',
            customerName: 'Mehmet Kaya',
            customerType: 'individual',
            contactEmail: 'mehmet@email.com',
            feedbackType: 'compliment',
            category: 'general',
            priority: 'low',
            subject: 'Mükemmel hizmet',
            description: 'Çok memnun kaldım, teşekkür ederim',
            rating: 5,
            status: 'resolved',
            department: 'Satış',
            source: 'phone',
            followUpRequired: false,
            tags: ['teşekkür', 'memnuniyet'],
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
            updatedAt: new Date().toISOString()
          },
          {
            id: 'fb_4',
            feedbackId: 'FB-2024-0004',
            customerName: 'Ayşe Özkan',
            customerType: 'corporate',
            companyName: 'XYZ Ltd.',
            contactEmail: 'ayse@xyz.com',
            feedbackType: 'quality_issue',
            category: 'delivery',
            priority: 'critical',
            subject: 'Teslimat gecikmesi',
            description: 'Siparişim 1 hafta geç geldi',
            rating: 1,
            status: 'closed',
            department: 'Lojistik',
            source: 'social_media',
            followUpRequired: true,
            tags: ['teslimat', 'gecikme'],
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 gün önce
            updatedAt: new Date().toISOString()
          }
        ];
        setFeedbacks(sampleData);
        localStorage.setItem('customer-feedbacks', JSON.stringify(sampleData));
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
    }
  };

  const saveFeedbacks = (data: CustomerFeedback[]) => {
    try {
      localStorage.setItem('customer-feedbacks', JSON.stringify(data));
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to save feedbacks:', error);
    }
  };

  // ✅ CRUD Operations
  const handleCreateFeedback = () => {
    setDialogMode('create');
    setFormData({
      customerName: '',
      customerType: 'individual',
      contactEmail: '',
      contactPhone: '',
      feedbackType: 'suggestion',
      category: 'general',
      priority: 'medium',
      subject: '',
      description: '',
      rating: 5,
      department: 'Kalite',
      source: 'website',
      followUpRequired: false,
      tags: []
    });
    setOpenDialog(true);
  };

  const handleSaveFeedback = () => {
    if (!formData.customerName || !formData.contactEmail || !formData.subject || !formData.description) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    if (dialogMode === 'edit' && selectedFeedback) {
      // Edit existing feedback
      const updatedFeedbacks = feedbacks.map(f => 
        f.id === selectedFeedback.id 
          ? {
              ...formData as CustomerFeedback,
              id: selectedFeedback.id,
              feedbackId: selectedFeedback.feedbackId,
              createdAt: selectedFeedback.createdAt,
              updatedAt: new Date().toISOString()
            }
          : f
      );
      saveFeedbacks(updatedFeedbacks);
    } else {
      // Create new feedback
      const newFeedback: CustomerFeedback = {
        ...formData as CustomerFeedback,
        id: `fb_${Date.now()}`,
        feedbackId: `FB-${new Date().getFullYear()}-${String(feedbacks.length + 1).padStart(4, '0')}`,
        status: 'open',
        assignedTo: 'Sistem',
        tags: formData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedFeedbacks = [...feedbacks, newFeedback];
      saveFeedbacks(updatedFeedbacks);
    }
    
    setOpenDialog(false);
  };

  const handleRespondToFeedback = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setResponseMessage('');
    setResponseDialog(true);
  };

  const handleSaveResponse = () => {
    if (!selectedFeedback || !responseMessage.trim()) {
      alert('Lütfen yanıt mesajını yazın!');
      return;
    }

    const updatedFeedbacks = feedbacks.map(f => 
      f.id === selectedFeedback.id 
        ? {
            ...f,
            responseMessage,
            responseDate: new Date().toISOString(),
            respondedBy: 'Kalite Uzmanı',
            status: 'in_progress' as const,
            updatedAt: new Date().toISOString()
          }
        : f
    );

    saveFeedbacks(updatedFeedbacks);
    setResponseDialog(false);
    setSelectedFeedback(null);
  };

  const handleViewFeedback = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setFormData(feedback);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditFeedback = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setFormData(feedback);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDeleteFeedback = (feedback: CustomerFeedback) => {
    if (window.confirm(`"${feedback.subject}" konulu geri bildirimi silmek istediğinizden emin misiniz?`)) {
      const updatedFeedbacks = feedbacks.filter(f => f.id !== feedback.id);
      saveFeedbacks(updatedFeedbacks);
    }
  };

  // ✅ Analytics Functions
  const getFeedbackStatistics = () => {
    const total = feedbacks.length;
    const open = feedbacks.filter(f => f.status === 'open').length;
    const resolved = feedbacks.filter(f => f.status === 'resolved').length;
    const avgRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length || 0;
    
    return { total, open, resolved, avgRating };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'complaint': return 'Şikayet';
      case 'suggestion': return 'Öneri';
      case 'compliment': return 'İltifat';
      case 'inquiry': return 'Soru';
      case 'quality_issue': return 'Kalite Sorunu';
      case 'service_issue': return 'Hizmet Sorunu';
      default: return type;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'product_quality': return 'Ürün Kalitesi';
      case 'service_quality': return 'Hizmet Kalitesi';
      case 'delivery': return 'Teslimat';
      case 'pricing': return 'Fiyatlandırma';
      case 'support': return 'Destek';
      case 'general': return 'Genel';
      default: return category;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Açık';
      case 'in_progress': return 'İşlemde';
      case 'resolved': return 'Çözüldü';
      case 'closed': return 'Kapatıldı';
      case 'escalated': return 'Yükseltildi';
      default: return status;
    }
  };

  const stats = getFeedbackStatistics();

  // Tab'a göre filtrelenmiş veriler
  const getFilteredFeedbacks = () => {
    switch (activeTab) {
      case 0: // Tüm Geri Bildirimler
        return feedbacks;
      case 1: // Açık Kayıtlar
        return feedbacks.filter(f => f.status === 'open');
      case 2: // Yanıt Bekleyenler
        return feedbacks.filter(f => f.status === 'open' || f.status === 'in_progress');
      case 3: // Çözümlenenler
        return feedbacks.filter(f => f.status === 'resolved' || f.status === 'closed');
      default:
        return feedbacks;
    }
  };

  const filteredFeedbacks = getFilteredFeedbacks();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Müşteri Geri Bildirim Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateFeedback}
        >
          Yeni Geri Bildirim
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Geri Bildirim
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
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.open}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Açık Kayıtlar
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
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.resolved}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Çözümlenen
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
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.avgRating.toFixed(1)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ortalama Puan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Tüm Geri Bildirimler (${feedbacks.length})`} />
          <Tab label={`Açık Kayıtlar (${feedbacks.filter(f => f.status === 'open').length})`} />
          <Tab label={`Yanıt Bekleyenler (${feedbacks.filter(f => f.status === 'open' || f.status === 'in_progress').length})`} />
          <Tab label={`Çözümlenenler (${feedbacks.filter(f => f.status === 'resolved' || f.status === 'closed').length})`} />
        </Tabs>
      </Box>

      {/* Feedback Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Geri Bildirim ID</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Öncelik</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Puan</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        {activeTab === 0 && 'Henüz geri bildirim bulunmamaktadır.'}
                        {activeTab === 1 && 'Açık geri bildirim bulunmamaktadır.'}
                        {activeTab === 2 && 'Yanıt bekleyen geri bildirim bulunmamaktadır.'}
                        {activeTab === 3 && 'Çözümlenmiş geri bildirim bulunmamaktadır.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.feedbackId}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {feedback.customerName}
                        </Typography>
                        {feedback.companyName && (
                          <Typography variant="caption" color="text.secondary">
                            {feedback.companyName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getFeedbackTypeLabel(feedback.feedbackType)} 
                        size="small" 
                        color={feedback.feedbackType === 'complaint' ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{getCategoryLabel(feedback.category)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getPriorityLabel(feedback.priority)} 
                        size="small" 
                        color={getPriorityColor(feedback.priority) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(feedback.status)} 
                        size="small" 
                        color={getStatusColor(feedback.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {feedback.rating && (
                        <Rating value={feedback.rating} readOnly size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleRespondToFeedback(feedback)} title="Yanıtla">
                        <ReplyIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleViewFeedback(feedback)} title="Görüntüle">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditFeedback(feedback)} title="Düzenle">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteFeedback(feedback)} title="Sil" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Yeni Geri Bildirim'}
          {dialogMode === 'edit' && 'Geri Bildirim Düzenle'}
          {dialogMode === 'view' && 'Geri Bildirim Görüntüle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Müşteri Adı"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                fullWidth
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-posta"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                fullWidth
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Geri Bildirim Türü</InputLabel>
                <Select
                  value={formData.feedbackType}
                  onChange={(e) => setFormData({...formData, feedbackType: e.target.value as any})}
                  disabled={dialogMode === 'view'}
                >
                  <MenuItem value="complaint">Şikayet</MenuItem>
                  <MenuItem value="suggestion">Öneri</MenuItem>
                  <MenuItem value="compliment">İltifat</MenuItem>
                  <MenuItem value="inquiry">Soru</MenuItem>
                  <MenuItem value="quality_issue">Kalite Sorunu</MenuItem>
                  <MenuItem value="service_issue">Hizmet Sorunu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  disabled={dialogMode === 'view'}
                >
                  <MenuItem value="product_quality">Ürün Kalitesi</MenuItem>
                  <MenuItem value="service_quality">Hizmet Kalitesi</MenuItem>
                  <MenuItem value="delivery">Teslimat</MenuItem>
                  <MenuItem value="pricing">Fiyatlandırma</MenuItem>
                  <MenuItem value="support">Destek</MenuItem>
                  <MenuItem value="general">Genel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Konu"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                fullWidth
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                fullWidth
                multiline
                rows={4}
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography component="legend">Müşteri Memnuniyeti</Typography>
              <Rating
                value={formData.rating}
                onChange={(e, newValue) => setFormData({...formData, rating: newValue || 5})}
                readOnly={dialogMode === 'view'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {dialogMode !== 'view' && (
            <Button variant="contained" onClick={handleSaveFeedback}>
              Kaydet
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Geri Bildirime Yanıt Ver</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Müşteri: {selectedFeedback.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Konu: {selectedFeedback.subject}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}
          <TextField
            label="Yanıt Mesajı"
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            fullWidth
            multiline
            rows={6}
            placeholder="Müşteriye gönderilecek yanıt mesajını yazın..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveResponse}>
            Yanıt Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerFeedbackManagement; 