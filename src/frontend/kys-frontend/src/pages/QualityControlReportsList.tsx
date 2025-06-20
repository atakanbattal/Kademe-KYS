import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import qualityControlReportService, { 
  QualityControlReport,
  QualityControlReportFilters 
} from '../services/qualityControlReportService';

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

const QualityControlReportsList: React.FC = () => {
  const [reports, setReports] = useState<QualityControlReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Filter states
  const [filters, setFilters] = useState<QualityControlReportFilters>({
    materialCode: '',
    supplierName: '',
    overallQualityGrade: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  });
  
  const [appliedFilters, setAppliedFilters] = useState<QualityControlReportFilters>({
    page: 1,
    limit: 10,
  });

  const [filterExpanded, setFilterExpanded] = useState(false);

  const loadReports = async (searchFilters: QualityControlReportFilters = appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await qualityControlReportService.getAllQualityControlReports(searchFilters);
      setReports(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Raporlar yüklenirken bir hata oluştu');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleApplyFilters = () => {
    const newFilters = { ...filters, page: 1 };
    setAppliedFilters(newFilters);
    loadReports(newFilters);
    setFilterExpanded(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = { page: 1, limit: 10 };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    loadReports(clearedFilters);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newFilters = { ...appliedFilters, page };
    setAppliedFilters(newFilters);
    loadReports(newFilters);
  };

  const handleDeleteReport = async (reportId: string) => {
    // eslint-disable-next-line no-restricted-globals
    // Rapor silme onayı kaldırıldı - sessiz silme
    if (true) {
      try {
        await qualityControlReportService.deleteQualityControlReport(reportId);
        loadReports();
        // Rapor silindi - sessiz işlem
      } catch (err) {
                  // Rapor silme hatası - sessiz hata
        console.error('Error deleting report:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getQualityGradeLabel = (grade: string) => {
    switch (grade) {
      case 'B': return 'Yüksek Kalite';
      case 'C': return 'Orta Kalite';
      case 'D': return 'Düşük Kalite';
      case 'REJECT': return 'Kabul Edilemez';
      default: return grade;
    }
  };

  const getQualityGradeColor = (grade: string) => {
    switch (grade) {
      case 'B': return '#4caf50';
      case 'C': return '#ff9800';
      case 'D': return '#f44336';
      case 'REJECT': return '#d32f2f';
      default: return '#9e9e9e';
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.materialCode) count++;
    if (appliedFilters.supplierName) count++;
    if (appliedFilters.overallQualityGrade) count++;
    if (appliedFilters.dateFrom) count++;
    if (appliedFilters.dateTo) count++;
    return count;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
        Kalite Kontrol Raporları
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {pagination.total || reports.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Rapor
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {reports.filter(r => r.testResults.validationResults?.status === 'ACCEPTED').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kabul Edilen
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {reports.filter(r => r.testResults.validationResults?.status === 'REJECTED').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reddedilen
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter Panel */}
      <StyledAccordion expanded={filterExpanded} onChange={(e, expanded) => setFilterExpanded(expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: '#ffffff' }} />
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
              Filtreler
            </Typography>
              {getActiveFilterCount() > 0 && (
                <Chip 
                  label={`${getActiveFilterCount()} aktif filtre`} 
                  size="small" 
                  color="primary"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Malzeme Kodu"
                  value={filters.materialCode || ''}
                  onChange={(e) => setFilters({ ...filters, materialCode: e.target.value })}
                  placeholder="Örn: ST37"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Tedarikçi Adı"
                  value={filters.supplierName || ''}
                  onChange={(e) => setFilters({ ...filters, supplierName: e.target.value })}
                  placeholder="Örn: ABC Çelik"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Kaynak Kalite Sınıfı</InputLabel>
                  <Select
                    value={filters.overallQualityGrade || ''}
                    onChange={(e) => setFilters({ ...filters, overallQualityGrade: e.target.value })}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="B">B - Yüksek Kalite</MenuItem>
                    <MenuItem value="C">C - Orta Kalite</MenuItem>
                    <MenuItem value="D">D - Düşük Kalite</MenuItem>
                    <MenuItem value="REJECT">REJECT - Kabul Edilemez</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Sayfa Başına Kayıt</InputLabel>
                  <Select
                    value={filters.limit || 10}
                    onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Temizle
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleApplyFilters}
              >
                Filtrele
              </Button>
            </Box>
          </AccordionDetails>
        </StyledAccordion>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Raporlar Listesi 
          {pagination.total > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({pagination.total} rapor)
            </Typography>
          )}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => loadReports()}
        >
          Yenile
        </Button>
      </Box>

      {/* Reports Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rapor ID</TableCell>
                <TableCell>Malzeme Kodu</TableCell>
                <TableCell>Tedarikçi</TableCell>
                <TableCell>Parti No</TableCell>
                <TableCell>Kaynak Kalite Sınıfı</TableCell>
                <TableCell>Muayene Durumu</TableCell>
                <TableCell>Kalite Kararı</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {getActiveFilterCount() > 0 
                      ? 'Filtrelere uygun rapor bulunamadı. Filtreleri değiştirmeyi deneyin.'
                      : 'Henüz rapor bulunamadı. Girdi Kalite Kontrol modülünden yeni raporlar oluşturun.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {report.reportId}
                      </Typography>
                    </TableCell>
                    <TableCell>{report.materialCode}</TableCell>
                    <TableCell>{report.supplierName}</TableCell>
                    <TableCell>{report.batchNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${report.overallQualityGrade} - ${getQualityGradeLabel(report.overallQualityGrade)}`}
                        size="small"
                        sx={{
                          backgroundColor: getQualityGradeColor(report.overallQualityGrade),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.testResults.validationResults?.status === 'ACCEPTED' ? 'KABUL' : 'RED'}
                        size="small"
                        sx={{
                          backgroundColor: report.testResults.validationResults?.status === 'ACCEPTED' ? '#4caf50' : '#f44336',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {report.testResults.validationResults?.qualityDecision ? (
                        <Chip
                          label={
                            report.testResults.validationResults.qualityDecision.type === 'DIRECT_REJECTION' ? 'Uygunsuzluk Raporu' :
                            report.testResults.validationResults.qualityDecision.type === 'CONDITIONAL_ACCEPTANCE' ? 'Şartlı Kabul' :
                            report.testResults.validationResults.qualityDecision.type === 'RE_EVALUATION' ? 'Tekrar Değerlendirme' :
                            'Standart Kabul'
                          }
                          size="small"
                          sx={{
                            backgroundColor: 
                              report.testResults.validationResults.qualityDecision.type === 'DIRECT_REJECTION' ? '#f44336' :
                              report.testResults.validationResults.qualityDecision.type === 'CONDITIONAL_ACCEPTANCE' ? '#ff9800' :
                              report.testResults.validationResults.qualityDecision.type === 'RE_EVALUATION' ? '#2196f3' :
                              '#4caf50',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {report.testResults.validationResults?.status === 'ACCEPTED' ? 'Standart Kabul' : '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Detayları Görüntüle">
                        <IconButton 
                          color="primary"
                          size="small"
                          onClick={() => {/* Rapor detayları - sessiz görüntüleme */}}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Raporu Sil">
                        <IconButton 
                          onClick={() => handleDeleteReport(report._id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={pagination.pages} 
              page={pagination.page} 
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default QualityControlReportsList; 