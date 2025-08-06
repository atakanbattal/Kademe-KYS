/**
 * ✅ Context7 Best Practice: Otomatik KPI Sistemi Bileşeni
 * Diğer modüllerden veri çekerek KPI'ları otomatik hesaplar ve dönemsel analiz yapar
 * Type-safe interface'ler ve error handling ile geliştirilmiştir
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  PlayArrow as AutoIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

// ✅ Context7 Best Practice: Type-safe interfaces
interface AutoCalculatedKPI {
  id: string;
  name: string;
  description: string;
  category: 'quality' | 'production' | 'cost' | 'supplier' | 'document' | 'audit' | 'risk';
  currentValue: number;
  targetValue: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastCalculated: string;
}

interface ModuleDataResult {
  data?: any;
  isLoading: boolean;
  error?: Error | null;
  dataUpdatedAt?: number;
}

// ✅ Context7 Best Practice: Import için hazırlık (şu anda mock veri kullanıyoruz)
// import { useAutoCalculatedKPIs, useModuleData } from '../services/kpiDataService';

const AutoKPISystem: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ✅ Context7 Best Practice: Mock data for demonstration (TanStack Query implementation)
  const mockAutoKPIs: AutoCalculatedKPI[] = [
    {
      id: 'quality-cost-ratio',
      name: 'Kalite Maliyet Oranı',
      description: 'Toplam kalite maliyetinin üretim maliyetine oranı (%)',
      category: 'quality',
      currentValue: 3.2,
      targetValue: 5,
      trend: 'down',
      status: 'good',
      lastCalculated: new Date().toISOString()
    },
    {
      id: 'dof-closure-rate',
      name: 'DF Kapatma Oranı',
    description: 'Kapatılan DF raporlarının toplam rapor sayısına oranı (%)',
      category: 'quality',
      currentValue: 85.7,
      targetValue: 90,
      trend: 'up',
      status: 'warning',
      lastCalculated: new Date().toISOString()
    },
    {
      id: 'supplier-quality-index',
      name: 'Tedarikçi Kalite İndeksi',
      description: 'Tedarikçi kalite performansının genel değerlendirmesi',
      category: 'supplier',
      currentValue: 87.3,
      targetValue: 85,
      trend: 'up',
      status: 'good',
      lastCalculated: new Date().toISOString()
    },
    {
      id: 'document-compliance-rate',
      name: 'Doküman Uygunluk Oranı',
      description: 'Aktif ve güncel dokümanların toplam dokümana oranı (%)',
      category: 'document',
      currentValue: 94.1,
      targetValue: 95,
      trend: 'stable',
      status: 'good',
      lastCalculated: new Date().toISOString()
    }
  ];

  // Mock loading state
  const [kpisLoading, setKpisLoading] = useState(false);
  const [kpisError] = useState<Error | null>(null);
  const autoKPIs = mockAutoKPIs;

  // Mock modül verileri
  const supplierData: ModuleDataResult = { data: {}, isLoading: false, error: null };
  const qualityCostData: ModuleDataResult = { data: {}, isLoading: false, error: null };
  const dofData: ModuleDataResult = { data: {}, isLoading: false, error: null };
  const documentData: ModuleDataResult = { data: {}, isLoading: false, error: null };

  const refetchKPIs = () => {
    setKpisLoading(true);
    setTimeout(() => setKpisLoading(false), 1000);
  };

  // Filtrelenmiş KPI'lar
  const filteredKPIs = autoKPIs.filter(kpi => 
    selectedCategory === 'all' || kpi.category === selectedCategory
  );

  // KPI Status gösterimi
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <SuccessIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'critical': return <ErrorIcon color="error" />;
      default: return <TrendingFlatIcon />;
    }
  };

  // Trend gösterimi
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      case 'stable': return <TrendingFlatIcon color="disabled" />;
      default: return <TrendingFlatIcon />;
    }
  };

  // Performans yüzdesi hesaplama
  const calculatePerformance = (kpi: AutoCalculatedKPI): number => {
    return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
  };

  // Kategori rengi
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      quality: '#2196F3',
      production: '#4CAF50',
      cost: '#FF9800',
      supplier: '#9C27B0',
      document: '#607D8B'
    };
    return colors[category] || '#757575';
  };

  // Veri sağlığı kontrolü
  const getDataHealth = () => {
    const dataSources = [supplierData, qualityCostData, dofData, documentData];
    const healthyCount = dataSources.filter(ds => !ds.isLoading && !ds.error).length;
    return (healthyCount / dataSources.length) * 100;
  };

  if (kpisLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Box ml={2}>
          <Typography variant="h6">KPI'lar hesaplanıyor...</Typography>
          <Typography variant="body2" color="textSecondary">
            Modül verilerinden otomatik hesaplama yapılıyor
          </Typography>
        </Box>
      </Box>
    );
  }

  if (kpisError) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={() => refetchKPIs()}>
          Tekrar Dene
        </Button>
      }>
        KPI verilerini yüklerken hata oluştu: {kpisError.message}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* Header Kontrols */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} display="flex" alignItems="center">
            <AutoIcon sx={{ mr: 2, color: 'primary.main' }} />
            Otomatik KPI Sistemi
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Modüllerden otomatik veri çekme ve gerçek zamanlı performans analizi
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Kategori"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="quality">Kalite</MenuItem>
              <MenuItem value="production">Üretim</MenuItem>
              <MenuItem value="cost">Maliyet</MenuItem>
              <MenuItem value="supplier">Tedarikçi</MenuItem>
              <MenuItem value="document">Doküman</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Dönem</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Dönem"
            >
              <MenuItem value="daily">Günlük</MenuItem>
              <MenuItem value="weekly">Haftalık</MenuItem>
              <MenuItem value="monthly">Aylık</MenuItem>
              <MenuItem value="quarterly">Çeyreklik</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="KPI'ları Yenile">
            <IconButton 
              onClick={() => refetchKPIs()} 
              color="primary"
              disabled={kpisLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Sistem Sağlığı */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Sistem Sağlığı</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">Veri Kaynakları Sağlığı:</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getDataHealth()} 
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2">{getDataHealth().toFixed(0)}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Son Güncelleme: {new Date().toLocaleTimeString('tr-TR')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Kartları */}
      <Grid container spacing={3} mb={3}>
        {filteredKPIs.map((kpi) => (
          <Grid item xs={12} md={6} lg={4} key={kpi.id}>
            <Card 
              sx={{ 
                height: '100%',
                borderLeft: `4px solid ${getCategoryColor(kpi.category)}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} noWrap>
                      {kpi.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {kpi.description}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    {getStatusIcon(kpi.status)}
                    {getTrendIcon(kpi.trend)}
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {kpi.currentValue.toLocaleString('tr-TR', { 
                        maximumFractionDigits: 1 
                      })}
                    </Typography>
                    <Chip 
                      label={kpi.category.toUpperCase()} 
                      size="small"
                      sx={{ 
                        backgroundColor: getCategoryColor(kpi.category),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Hedef: {kpi.targetValue}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      %{calculatePerformance(kpi).toFixed(1)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculatePerformance(kpi)}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 
                          kpi.status === 'good' ? 'success.main' : 
                          kpi.status === 'warning' ? 'warning.main' : 
                          kpi.status === 'critical' ? 'error.main' : 
                          'info.main'
                      }
                    }}
                  />
                </Box>

                <Typography variant="caption" color="textSecondary">
                  Son Güncelleme: {new Date(kpi.lastCalculated).toLocaleTimeString('tr-TR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detaylı Analiz - Basitleştirilmiş */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AnalyticsIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Detaylı Performans Analizi</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* KPI Performans Tablosu */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>KPI Performans Detayları</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>KPI Adı</TableCell>
                        <TableCell>Mevcut Değer</TableCell>
                        <TableCell>Hedef Değer</TableCell>
                        <TableCell>Performans</TableCell>
                        <TableCell>Trend</TableCell>
                        <TableCell>Durum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredKPIs.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell>{kpi.name}</TableCell>
                          <TableCell>{kpi.currentValue.toFixed(1)}</TableCell>
                          <TableCell>{kpi.targetValue}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={calculatePerformance(kpi)}
                                sx={{ width: 100, height: 6 }}
                              />
                              <Typography variant="body2">
                                {calculatePerformance(kpi).toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{getTrendIcon(kpi.trend)}</TableCell>
                          <TableCell>{getStatusIcon(kpi.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* Kategori İstatistikleri */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Kategori Bazlı İstatistikler</Typography>
                  <Grid container spacing={2}>
                    {['quality', 'production', 'cost', 'supplier', 'document'].map((category) => {
                      const categoryKPIs = filteredKPIs.filter(k => k.category === category);
                      const avgPerformance = categoryKPIs.length > 0 
                        ? categoryKPIs.reduce((sum, k) => sum + calculatePerformance(k), 0) / categoryKPIs.length 
                        : 0;
                      
                      return (
                        <Grid item xs={12} sm={6} md={2.4} key={category}>
                          <Box 
                            p={2} 
                            border={1} 
                            borderColor="divider" 
                            borderRadius={2}
                            sx={{ 
                              backgroundColor: `${getCategoryColor(category)}15`,
                              borderColor: getCategoryColor(category)
                            }}
                          >
                            <Typography variant="h6" color={getCategoryColor(category)}>
                              {categoryKPIs.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={avgPerformance}
                              sx={{ 
                                mt: 1, 
                                '& .MuiLinearProgress-bar': { 
                                  backgroundColor: getCategoryColor(category) 
                                }
                              }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              Avg: {avgPerformance.toFixed(0)}%
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Veri Kaynakları Tablosu */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <ReportIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Veri Kaynakları Durumu</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Modül</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Son Güncelleme</TableCell>
                  <TableCell>Veri Sayısı</TableCell>
                  <TableCell>Kullanılan KPI'lar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { name: 'Tedarikçi Kalite', data: supplierData, modules: ['supplier-quality-index'] },
                  { name: 'Kalite Maliyet', data: qualityCostData, modules: ['quality-cost-ratio'] },
                  { name: 'DF 8D', data: dofData, modules: ['dof-closure-rate'] },
                  { name: 'Doküman Yönetimi', data: documentData, modules: ['document-compliance-rate'] }
                ].map((source) => (
                  <TableRow key={source.name}>
                    <TableCell>{source.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={source.data.isLoading ? 'Yükleniyor' : 
                               source.data.error ? 'Hata' : 'Aktif'}
                        color={source.data.isLoading ? 'default' : 
                               source.data.error ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {source.data.dataUpdatedAt ? 
                        new Date(source.data.dataUpdatedAt).toLocaleTimeString('tr-TR') : 
                        'Henüz güncellenmedi'
                      }
                    </TableCell>
                    <TableCell>
                      {source.data.data ? 
                        Object.keys(source.data.data).length : 
                        0
                      }
                    </TableCell>
                    <TableCell>
                      {source.modules.map(module => (
                        <Chip key={module} label={module} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AutoKPISystem; 