import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  IconButton,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
  Warning as ExpiredIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Types
interface Document {
  id: string;
  name: string;
  type: DocumentType;
  number: string;
  department: string;
  owner: string;
  effectiveDate: string;
  expiryDate?: string;
  status: DocumentStatus;
  description: string;
  createdDate: string;
  lastModified: string;
  // Kaynakçı sertifikası özel alanları
  welderName?: string;
  welderRegistrationNo?: string;
  certificateType?: string;
  issuingAuthority?: string;
}

type DocumentType = 
  | 'WPS'
  | 'WPQR'
  | 'Prosedür'
  | 'Talimat'
  | 'Kontrol Listesi'
  | 'ISO 9001 Belgesi'
  | 'ISO 14001 Belgesi'
  | 'TS 3834-2 Belgesi'
  | 'Kaynakçı Sertifikası'
  | 'NDT Sertifikası'
  | 'İSG Sertifikası'
  | 'Diğer';

type DocumentStatus = 'active' | 'draft' | 'expired' | 'archived';

interface DocumentForm {
  id?: string;
  name: string;
  type: DocumentType;
  number: string;
  department: string;
  owner: string;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  // Kaynakçı sertifikası alanları
  welderName: string;
  welderRegistrationNo: string;
  certificateType: string;
  issuingAuthority: string;
}

// Constants
const DOCUMENT_TYPES: DocumentType[] = [
  'WPS',
  'WPQR',
  'Prosedür',
  'Talimat',
  'Kontrol Listesi',
  'ISO 9001 Belgesi',
  'ISO 14001 Belgesi',
  'TS 3834-2 Belgesi',
  'Kaynakçı Sertifikası',
  'NDT Sertifikası',
  'İSG Sertifikası',
  'Diğer'
];

const DEPARTMENTS = [
  'Genel Müdürlük',
  'Kalite Güvence',
  'Kalite Kontrol',
  'Kaynak Atölyesi',
  'Makine Atölyesi',
  'Montaj Hattı',
  'Teknik Büro',
  'İnsan Kaynakları',
  'İş Sağlığı ve Güvenliği',
  'Satın Alma',
];

const CERTIFICATE_TYPES = [
  'EN ISO 9606-1',
  'EN ISO 9606-2',
  'EN ISO 14732',
  'ASME IX',
  'AWS D1.1',
  'EN 287-1',
];

const ISSUING_AUTHORITIES = [
  'TSE',
  'TÜV NORD',
  'TÜV SÜD',
  'Bureau Veritas',
  'SGS',
  'TÜRKAK',
  'Çalışma Bakanlığı',
  'Diğer',
];

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)<{ status: DocumentStatus }>(({ theme, status }) => {
  const colors = {
    active: { bg: theme.palette.success.light, text: theme.palette.success.contrastText },
    draft: { bg: theme.palette.warning.light, text: theme.palette.warning.contrastText },
    expired: { bg: theme.palette.error.light, text: theme.palette.error.contrastText },
    archived: { bg: theme.palette.grey[400], text: theme.palette.grey[800] },
  };
  
  return {
    backgroundColor: colors[status].bg,
    color: colors[status].text,
    fontWeight: 600,
  };
});

const DocumentManagement: React.FC = () => {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  
  // Form State
  const [form, setForm] = useState<DocumentForm>({
    name: '',
    type: 'WPS',
    number: '',
    department: '',
    owner: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    description: '',
    welderName: '',
    welderRegistrationNo: '',
    certificateType: '',
    issuingAuthority: '',
  });

  // LocalStorage operations
  useEffect(() => {
    const savedDocuments = localStorage.getItem('document-management-documents');
    if (savedDocuments && savedDocuments !== 'null') {
      try {
        const parsed = JSON.parse(savedDocuments);
        if (Array.isArray(parsed)) {
          setDocuments(parsed);
          console.log('✅ Dokümanlar yüklendi:', parsed.length, 'adet');
        }
      } catch (error) {
        console.error('Doküman yükleme hatası:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('document-management-documents', JSON.stringify(documents));
      console.log('💾 Dokümanlar kaydedildi:', documents.length, 'adet');
    }
  }, [documents]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.welderName && doc.welderName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !filterType || doc.type === filterType;
      const matchesStatus = !filterStatus || doc.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchTerm, filterType, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const active = documents.filter(d => d.status === 'active').length;
    const draft = documents.filter(d => d.status === 'draft').length;
    const expiring = documents.filter(d => {
      if (!d.expiryDate) return false;
      const today = new Date();
      const expiry = new Date(d.expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    
    return { total, active, draft, expiring };
  }, [documents]);

  // Handlers
  const handleOpenDialog = (doc?: Document) => {
    if (doc) {
      setEditMode(true);
      setSelectedDocument(doc);
      setForm({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        number: doc.number,
        department: doc.department,
        owner: doc.owner,
        effectiveDate: doc.effectiveDate,
        expiryDate: doc.expiryDate || '',
        description: doc.description,
        welderName: doc.welderName || '',
        welderRegistrationNo: doc.welderRegistrationNo || '',
        certificateType: doc.certificateType || '',
        issuingAuthority: doc.issuingAuthority || '',
      });
    } else {
      setEditMode(false);
      setSelectedDocument(null);
      setForm({
        name: '',
        type: 'WPS',
        number: '',
        department: '',
        owner: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        description: '',
        welderName: '',
        welderRegistrationNo: '',
        certificateType: '',
        issuingAuthority: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedDocument(null);
  };

  const handleSaveDocument = () => {
    // Validation
    if (!form.name || !form.type || !form.department || !form.owner) {
      setSnackbar({ open: true, message: 'Lütfen zorunlu alanları doldurun!', severity: 'error' });
      return;
    }

    // Kaynakçı sertifikası için özel validation
    if (form.type === 'Kaynakçı Sertifikası') {
      if (!form.welderName || !form.welderRegistrationNo) {
        setSnackbar({ open: true, message: 'Kaynakçı sertifikası için kaynakçı bilgileri zorunludur!', severity: 'error' });
        return;
      }
    }

    const now = new Date().toISOString();
    
    if (editMode && selectedDocument) {
      // Update existing document
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id 
          ? {
              ...doc,
              name: form.name,
              type: form.type,
              number: form.number || `DOC-${Date.now().toString().slice(-6)}`,
              department: form.department,
              owner: form.owner,
              effectiveDate: form.effectiveDate,
              expiryDate: form.expiryDate || undefined,
              description: form.description,
              lastModified: now,
              status: 'active' as DocumentStatus,
              welderName: form.type === 'Kaynakçı Sertifikası' ? form.welderName : undefined,
              welderRegistrationNo: form.type === 'Kaynakçı Sertifikası' ? form.welderRegistrationNo : undefined,
              certificateType: form.type === 'Kaynakçı Sertifikası' ? form.certificateType : undefined,
              issuingAuthority: form.type === 'Kaynakçı Sertifikası' ? form.issuingAuthority : undefined,
            }
          : doc
      ));
      setSnackbar({ open: true, message: `"${form.name}" başarıyla güncellendi!`, severity: 'success' });
    } else {
      // Create new document
      const newDocument: Document = {
        id: `DOC-${Date.now()}`,
        name: form.name,
        type: form.type,
        number: form.number || `DOC-${Date.now().toString().slice(-6)}`,
        department: form.department,
        owner: form.owner,
        effectiveDate: form.effectiveDate,
        expiryDate: form.expiryDate || undefined,
        description: form.description,
        status: 'active',
        createdDate: now,
        lastModified: now,
        welderName: form.type === 'Kaynakçı Sertifikası' ? form.welderName : undefined,
        welderRegistrationNo: form.type === 'Kaynakçı Sertifikası' ? form.welderRegistrationNo : undefined,
        certificateType: form.type === 'Kaynakçı Sertifikası' ? form.certificateType : undefined,
        issuingAuthority: form.type === 'Kaynakçı Sertifikası' ? form.issuingAuthority : undefined,
      };
      
      setDocuments(prev => [...prev, newDocument]);
      
      if (form.type === 'Kaynakçı Sertifikası') {
        setSnackbar({ open: true, message: `🎉 ${form.welderName} kaynakçısının sertifikası başarıyla kaydedildi!`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: `"${form.name}" başarıyla oluşturuldu!`, severity: 'success' });
      }
    }
    
    handleCloseDialog();
  };

  const handleDeleteDocument = (doc: Document) => {
    if (window.confirm(`"${doc.name}" dokümanını silmek istediğinizden emin misiniz?`)) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      setSnackbar({ open: true, message: `"${doc.name}" başarıyla silindi!`, severity: 'success' });
    }
  };

  const handleExportPDF = () => {
    const content = `DOKÜMAN LİSTESİ
Tarih: ${new Date().toLocaleDateString('tr-TR')}
Toplam Doküman: ${filteredDocuments.length}

${filteredDocuments.map(doc => 
  `${doc.number} - ${doc.name}
  Tip: ${doc.type}
  Departman: ${doc.department}
  Sorumlu: ${doc.owner}
  Durum: ${doc.status}
  Yürürlük: ${doc.effectiveDate}
  ${doc.expiryDate ? `Geçerlilik: ${doc.expiryDate}` : ''}
  ${doc.welderName ? `Kaynakçı: ${doc.welderName} (${doc.welderRegistrationNo})` : ''}
  ---`
).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dokuman-listesi-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Doküman listesi başarıyla indirildi!', severity: 'success' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'active': return <ActiveIcon sx={{ fontSize: 18, color: 'success.main' }} />;
      case 'draft': return <PendingIcon sx={{ fontSize: 18, color: 'warning.main' }} />;
      case 'expired': return <ExpiredIcon sx={{ fontSize: 18, color: 'error.main' }} />;
      default: return <DocumentIcon sx={{ fontSize: 18, color: 'grey.500' }} />;
    }
  };

  const isWelderCertificate = form.type === 'Kaynakçı Sertifikası';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Doküman Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PdfIcon />} onClick={handleExportPDF}>
            PDF İndir
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Yeni Doküman
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight={700}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Doküman
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight={700}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif Doküman
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                {stats.draft}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taslak Doküman
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" fontWeight={700}>
                {stats.expiring}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Süresi Dolacak
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Doküman, numara, sorumlu ara..."
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Doküman Tipi</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Doküman Tipi"
              >
                <MenuItem value="">Tümü</MenuItem>
                {DOCUMENT_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Durum"
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="draft">Taslak</MenuItem>
                <MenuItem value="expired">Süresi Dolmuş</MenuItem>
                <MenuItem value="archived">Arşivlenmiş</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Doküman Adı</strong></TableCell>
              <TableCell><strong>Tip</strong></TableCell>
              <TableCell><strong>Numara</strong></TableCell>
              <TableCell><strong>Departman</strong></TableCell>
              <TableCell><strong>Sorumlu</strong></TableCell>
              <TableCell><strong>Durum</strong></TableCell>
              <TableCell><strong>Yürürlük</strong></TableCell>
              <TableCell align="center"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm || filterType || filterStatus 
                      ? 'Arama kriterlerinize uygun doküman bulunamadı.'
                      : 'Henüz doküman eklenmemiş. "Yeni Doküman" butonu ile başlayın.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {doc.name}
                      </Typography>
                      {doc.welderName && (
                        <Typography variant="caption" color="text.secondary">
                          Kaynakçı: {doc.welderName} ({doc.welderRegistrationNo})
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={doc.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{doc.number}</TableCell>
                  <TableCell>{doc.department}</TableCell>
                  <TableCell>{doc.owner}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(doc.status)}
                      <StatusChip 
                        label={
                          doc.status === 'active' ? 'Aktif' :
                          doc.status === 'draft' ? 'Taslak' :
                          doc.status === 'expired' ? 'Süresi Dolmuş' : 'Arşivlenmiş'
                        } 
                        size="small" 
                        status={doc.status}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(doc.effectiveDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleOpenDialog(doc)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => handleDeleteDocument(doc)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Document Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Doküman Düzenle' : 'Yeni Doküman Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            {/* Basic Information */}
            <TextField
              label="Doküman Adı"
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Doküman Tipi</InputLabel>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as DocumentType }))}
                    label="Doküman Tipi"
                  >
                    {DOCUMENT_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Doküman Numarası"
                  fullWidth
                  value={form.number}
                  onChange={(e) => setForm(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Otomatik oluşturulacak"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    value={form.department}
                    onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                    label="Departman"
                  >
                    {DEPARTMENTS.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Sorumlu Kişi"
                  fullWidth
                  required
                  value={form.owner}
                  onChange={(e) => setForm(prev => ({ ...prev, owner: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Yürürlük Tarihi"
                  type="date"
                  fullWidth
                  required
                  value={form.effectiveDate}
                  onChange={(e) => setForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Geçerlilik Tarihi"
                  type="date"
                  fullWidth
                  value={form.expiryDate}
                  onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Kaynakçı Sertifikası Özel Alanları */}
            {isWelderCertificate && (
              <>
                <Divider>
                  <Chip label="Kaynakçı Sertifikası Bilgileri" />
                </Divider>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Kaynakçı Adı"
                      fullWidth
                      required
                      value={form.welderName}
                      onChange={(e) => setForm(prev => ({ ...prev, welderName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Sicil Numarası"
                      fullWidth
                      required
                      value={form.welderRegistrationNo}
                      onChange={(e) => setForm(prev => ({ ...prev, welderRegistrationNo: e.target.value }))}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Sertifika Tipi</InputLabel>
                      <Select
                        value={form.certificateType}
                        onChange={(e) => setForm(prev => ({ ...prev, certificateType: e.target.value }))}
                        label="Sertifika Tipi"
                      >
                        {CERTIFICATE_TYPES.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Veren Kuruluş</InputLabel>
                      <Select
                        value={form.issuingAuthority}
                        onChange={(e) => setForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                        label="Veren Kuruluş"
                      >
                        {ISSUING_AUTHORITIES.map(auth => (
                          <MenuItem key={auth} value={auth}>{auth}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </>
            )}

            <TextField
              label="Açıklama"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="contained" onClick={handleSaveDocument}>
            {editMode ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentManagement; 