import React, { useState, useMemo, useContext, createContext, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardHeader,
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
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Container,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Engineering as EngineeringIcon,
  PictureAsPdf as PdfIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Air as AirIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayIcon,
  List as ListIcon,
  Assessment as AssessmentIcon,
  Balance as BalanceIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Policy as PolicyIcon,
  Thermostat as ThermostatIcon,
  Report as ReportIcon,
  FilterAlt as FilterAltIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// DÖF/8D Integration Import
import { navigateToDOFForm, checkDOFStatus, DOFCreationParams } from '../utils/dofIntegration';
import { styled } from '@mui/material/styles';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types and Interfaces
interface TestRecord {
  id: string;
  testNumber: string;
  productInfo: {
    productType: string;
    serialNumber: string;
    diameter: number;
    customer: string;
  };
  testDate: string;
  operator: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  overallResult: 'pass' | 'conditional' | 'fail';
  balanceTest?: {
    unbalanceAmount: number;
    balanceGrade: string;
    passed: boolean;
  };
  weldingInspection?: {
    overallGrade: string;
    passed: boolean;
  };
  certificateIssued: boolean;
}

interface TestContextType {
  testRecords: TestRecord[];
  setTestRecords: React.Dispatch<React.SetStateAction<TestRecord[]>>;
  selectedTest: TestRecord | null;
  setSelectedTest: React.Dispatch<React.SetStateAction<TestRecord | null>>;
}

// Constants
const PRODUCT_TYPES = [
  { value: 'ust_yapi', label: 'Üst Yapı', color: '#2196f3' },
  { value: 'kompakt', label: 'Kompakt', color: '#4caf50' },
  { value: 'rusya_motor_odasi', label: 'Rusya Motor Odası', color: '#ff9800' },
];

const STATUS_COLORS = {
  planning: '#9e9e9e',
  in_progress: '#2196f3',
  completed: '#4caf50',
  failed: '#f44336',
};

const RESULT_COLORS = {
  pass: '#4caf50',
  conditional: '#ff9800',
  fail: '#f44336',
};

// ✅ Türkçe çeviri fonksiyonları eklendi
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'planning': 'Planlama',
    'in_progress': 'Devam Ediyor',
    'completed': 'Tamamlandı',
    'failed': 'Başarısız'
  };
  return statusMap[status] || status;
};

const getResultLabel = (result: string): string => {
  const resultMap: Record<string, string> = {
    'pass': 'Başarılı',
    'conditional': 'Koşullu',
    'fail': 'Başarısız'
  };
  return resultMap[result] || result;
};

// Context
const TestContext = createContext<TestContextType | undefined>(undefined);

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
  border: `1px solid ${theme.palette.primary.main}30`,
  borderRadius: 12,
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
  color: 'white',
  fontWeight: 'bold',
}));

const ResultChip = styled(Chip)<{ result: string }>(({ theme, result }) => ({
  backgroundColor: RESULT_COLORS[result as keyof typeof RESULT_COLORS],
  color: 'white',
  fontWeight: 'bold',
}));

// StyledAccordion for filtering system
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
})) as any;

// Reports Module Component
const ReportsModule: React.FC = () => {
  const { testRecords } = useContext(TestContext)!;
  const [selectedReportType, setSelectedReportType] = useState<string>('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');

  // Statistics calculation
  const statistics = useMemo(() => {
    let filteredRecords = testRecords;
    
    // Date filter
    if (dateRange.start && dateRange.end) {
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.testDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.status === selectedStatus);
    }
    
    // Result filter
    if (selectedResult !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.overallResult === selectedResult);
    }

    const totalTests = filteredRecords.length;
    const passedTests = filteredRecords.filter(r => r.overallResult === 'pass').length;
    const failedTests = filteredRecords.filter(r => r.overallResult === 'fail').length;
    const conditionalTests = filteredRecords.filter(r => r.overallResult === 'conditional').length;
    const completedTests = filteredRecords.filter(r => r.status === 'completed').length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

    // Product type distribution
    const productTypeStats = PRODUCT_TYPES.map(type => ({
      ...type,
      count: filteredRecords.filter(r => r.productInfo.productType === type.value).length
    }));

    // Monthly test distribution
    const monthlyStats = filteredRecords.reduce((acc, record) => {
      const month = new Date(record.testDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Operator performance
    const operatorStats = filteredRecords.reduce((acc, record) => {
      if (!acc[record.operator]) {
        acc[record.operator] = { total: 0, passed: 0, failed: 0, conditional: 0 };
      }
      acc[record.operator].total++;
      acc[record.operator][record.overallResult]++;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalTests,
      passedTests,
      failedTests,
      conditionalTests,
      completedTests,
      passRate,
      productTypeStats,
      monthlyStats,
      operatorStats,
      filteredRecords
    };
  }, [testRecords, dateRange, selectedStatus, selectedResult]);

  // Generate comprehensive report
  const handleGenerateReport = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Turkish character converter
    const turkishToAscii = (text: string): string => {
      return text
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U');
    };

    // Header
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(turkishToAscii('KADEME A.S. - FAN TEST ANALIZ RAPORU'), 20, 15);
    doc.setFontSize(12);
    doc.text(turkishToAscii('Kapsamli Test Performans ve Kalite Analizi'), 20, 25);
    doc.setFontSize(10);
    doc.text(turkishToAscii(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`), 20, 32);

    let yPos = 50;

    // Summary statistics
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(turkishToAscii('OZET ISTATISTIKLER'), 20, yPos);
    yPos += 10;

    const summaryData = [
      ['Toplam Test Sayisi', statistics.totalTests.toString()],
      ['Basarili Testler', `${statistics.passedTests} (${statistics.passRate}%)`],
      ['Basarisiz Testler', statistics.failedTests.toString()],
      ['Kosullu Testler', statistics.conditionalTests.toString()],
      ['Tamamlanan Testler', statistics.completedTests.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [[turkishToAscii('Metrik'), turkishToAscii('Deger')]],
      body: summaryData.map(row => [turkishToAscii(row[0]), turkishToAscii(row[1])]),
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Product type distribution
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(turkishToAscii('URUN TIPI DAGILIMI'), 20, yPos);
    yPos += 10;

    const productData = statistics.productTypeStats.map(type => [
      turkishToAscii(type.label),
      type.count.toString(),
      `${((type.count / statistics.totalTests) * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[turkishToAscii('Urun Tipi'), turkishToAscii('Test Sayisi'), turkishToAscii('Oran')]],
      body: productData,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Operator performance
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(turkishToAscii('OPERATOR PERFORMANSI'), 20, yPos);
    yPos += 10;

    const operatorData = Object.entries(statistics.operatorStats).map(([operator, stats]: [string, any]) => [
      turkishToAscii(operator),
      stats.total.toString(),
      stats.passed.toString(),
      stats.failed.toString(),
      `${((stats.passed / stats.total) * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[turkishToAscii('Operator'), turkishToAscii('Toplam'), turkishToAscii('Basarili'), turkishToAscii('Basarisiz'), turkishToAscii('Basari Orani')]],
      body: operatorData,
      theme: 'grid',
      headStyles: { fillColor: [255, 152, 0] },
      margin: { left: 20, right: 20 }
    });

    doc.save(`fan-test-analiz-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          Raporlar ve Analiz
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filtreler</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rapor Türü</InputLabel>
              <Select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                label="Rapor Türü"
              >
                <MenuItem value="summary">Özet Rapor</MenuItem>
                <MenuItem value="detailed">Detaylı Analiz</MenuItem>
                <MenuItem value="performance">Performans Raporu</MenuItem>
                <MenuItem value="quality">Kalite Raporu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Başlangıç Tarihi"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Bitiş Tarihi"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Durum"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="planning">Planlama</MenuItem>
                <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
                <MenuItem value="failed">Başarısız</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sonuç</InputLabel>
              <Select
                value={selectedResult}
                onChange={(e) => setSelectedResult(e.target.value)}
                label="Sonuç"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="pass">Başarılı</MenuItem>
                <MenuItem value="conditional">Koşullu</MenuItem>
                <MenuItem value="fail">Başarısız</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateReport}
              startIcon={<PdfIcon />}
              sx={{ height: '56px' }}
            >
              PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {statistics.totalTests}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Toplam Test
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {statistics.passRate}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Başarı Oranı
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {statistics.completedTests}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tamamlanan
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" fontWeight="bold">
                {statistics.failedTests}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Başarısız
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Charts and Analysis */}
      <Grid container spacing={3}>
        {/* Product Type Distribution */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title="Ürün Tipi Dağılımı"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.productTypeStats}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {statistics.productTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Test Results Summary */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title="Test Sonuçları Özeti"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Başarılı</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(statistics.passedTests / statistics.totalTests) * 100}
                      sx={{ width: 100, height: 8, borderRadius: 4 }}
                      color="success"
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {statistics.passedTests}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Koşullu</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(statistics.conditionalTests / statistics.totalTests) * 100}
                      sx={{ width: 100, height: 8, borderRadius: 4 }}
                      color="warning"
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {statistics.conditionalTests}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Başarısız</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(statistics.failedTests / statistics.totalTests) * 100}
                      sx={{ width: 100, height: 8, borderRadius: 4 }}
                      color="error"
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {statistics.failedTests}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Operator Performance */}
        <Grid item xs={12}>
          <StyledCard>
            <CardHeader
              title="Operatör Performans Tablosu"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Operatör</strong></TableCell>
                      <TableCell align="center"><strong>Toplam Test</strong></TableCell>
                      <TableCell align="center"><strong>Başarılı</strong></TableCell>
                      <TableCell align="center"><strong>Koşullu</strong></TableCell>
                      <TableCell align="center"><strong>Başarısız</strong></TableCell>
                      <TableCell align="center"><strong>Başarı Oranı</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(statistics.operatorStats).map(([operator, stats]: [string, any]) => (
                      <TableRow key={operator} hover>
                        <TableCell component="th" scope="row">
                          <Typography fontWeight="bold">{operator}</Typography>
                        </TableCell>
                        <TableCell align="center">{stats.total}</TableCell>
                        <TableCell align="center">
                          <Chip label={stats.passed} color="success" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stats.conditional} color="warning" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stats.failed} color="error" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="bold" color={stats.passed / stats.total >= 0.8 ? 'success.main' : 'warning.main'}>
                            {((stats.passed / stats.total) * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
};

// Sample Data
const mockTestRecords: TestRecord[] = [
  {
    id: 'TEST001',
    testNumber: 'FT-2024-001',
    productInfo: {
      productType: 'ust_yapi',
      serialNumber: 'UY-2024-001',
      diameter: 450,
      customer: 'ABC Sanayi A.Ş.',
    },
    testDate: '2024-01-20',
    operator: 'Mehmet Yılmaz',
    status: 'completed',
    overallResult: 'pass',
    balanceTest: {
      unbalanceAmount: 15.2,
      balanceGrade: 'G6.3',
      passed: true,
    },
    weldingInspection: {
      overallGrade: 'B',
      passed: true,
    },
    certificateIssued: true,
  },
  {
    id: 'TEST002',
    testNumber: 'FT-2024-002',
    productInfo: {
      productType: 'kompakt',
      serialNumber: 'KMP-2024-002',
      diameter: 350,
      customer: 'XYZ Teknik Ltd.',
    },
    testDate: '2024-01-22',
    operator: 'Ayşe Demir',
    status: 'completed',
    overallResult: 'pass',
    balanceTest: {
      unbalanceAmount: 8.5,
      balanceGrade: 'G2.5',
      passed: true,
    },
    weldingInspection: {
      overallGrade: 'B',
      passed: true,
    },
    certificateIssued: true,
  },
  {
    id: 'TEST003',
    testNumber: 'FT-2024-003',
    productInfo: {
      productType: 'ust_yapi',
      serialNumber: 'UY-2024-003',
      diameter: 520,
      customer: 'DEF Endüstri A.Ş.',
    },
    testDate: '2024-01-25',
    operator: 'Ahmet Kaya',
    status: 'completed',
    overallResult: 'fail',
    balanceTest: {
      unbalanceAmount: 45.8,
      balanceGrade: 'G40',
      passed: false,
    },
    weldingInspection: {
      overallGrade: 'D',
      passed: false,
    },
    certificateIssued: false,
  },
];

// Tab Panel Component
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
      id={`fan-tabpanel-${index}`}
      aria-labelledby={`fan-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Dashboard Component
const TestDashboard: React.FC = () => {
  const context = useContext(TestContext);
  if (!context) throw new Error('TestDashboard must be used within TestProvider');
  
  const { testRecords } = context;

  // Calculations
  const totalTests = testRecords.length;
  const completedTests = testRecords.filter(t => t.status === 'completed').length;
  const inProgressTests = testRecords.filter(t => t.status === 'in_progress').length;
  
  // ✅ Başarı oranı sadece tamamlanan testler üzerinden hesaplanmalı
  const passRate = completedTests > 0 ? 
    (testRecords.filter(t => t.status === 'completed' && t.overallResult === 'pass').length / completedTests) * 100 : 0;

  // Chart Data
  const productTypeData = PRODUCT_TYPES.map(type => ({
    name: type.label,
    count: testRecords.filter(t => t.productInfo.productType === type.value).length,
    color: type.color,
  })).filter(type => type.count > 0);

  return (
    <Container maxWidth={false}>
      {/* Key Metrics */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4,
        '& > *': { 
          flex: '1 1 250px',
          minWidth: '250px'
        }
      }}>
        <MetricCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <AirIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {totalTests}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Test
            </Typography>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {completedTests}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tamamlanan Test
            </Typography>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {passRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Başarı Oranı
            </Typography>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <PlayIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {inProgressTests}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Devam Eden Test
            </Typography>
          </CardContent>
        </MetricCard>
      </Box>

      {/* Charts */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3,
        '& > *': { 
          flex: '1 1 400px',
          minWidth: '400px'
        }
      }}>
        <StyledCard>
          <CardHeader 
            title="Ürün Tipi Dağılımı" 
            action={
              <Chip 
                label={`${testRecords.length} Test`} 
                size="small" 
                color="primary" 
              />
            }
          />
          <CardContent>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {productTypeData.map((product, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  background: `${product.color}15`,
                  border: `1px solid ${product.color}30`
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: product.color, fontWeight: 'bold' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.count} test
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardHeader title="Test İstatistikleri" />
          <CardContent>
            {productTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="count"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {productTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">Henüz test verisi bulunmamaktadır.</Alert>
            )}
          </CardContent>
        </StyledCard>
      </Box>
    </Container>
  );
};

// Test Management Component
const TestManagement: React.FC = () => {
  const context = useContext(TestContext);
  if (!context) throw new Error('TestManagement must be used within TestProvider');
  
  const { testRecords, setTestRecords } = context;
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedTestForView, setSelectedTestForView] = useState<TestRecord | null>(null);
  const [selectedTestForEdit, setSelectedTestForEdit] = useState<TestRecord | null>(null);
  const [showSuccess, setShowSuccess] = useState<string>('');

  // Advanced filtering states
  const [filters, setFilters] = useState({
    serialNumber: '',
    productType: '',
    status: '',
    result: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
    operator: '',
    period: '', // dönem (ay/çeyrek)
    year: new Date().getFullYear().toString(),
    month: '',
    quarter: '',
    customer: ''
  });

  // Filter expansion state
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Filtreleme seçenekleri
  const periodOptions = [
    { value: 'monthly', label: 'Aylık' },
    { value: 'quarterly', label: 'Çeyreklik' },
    { value: 'custom', label: 'Özel Tarih Aralığı' }
  ];

  const yearOptions = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' }
  ];

  const monthOptions = [
    { value: '01', label: 'Ocak' },
    { value: '02', label: 'Şubat' },
    { value: '03', label: 'Mart' },
    { value: '04', label: 'Nisan' },
    { value: '05', label: 'Mayıs' },
    { value: '06', label: 'Haziran' },
    { value: '07', label: 'Temmuz' },
    { value: '08', label: 'Ağustos' },
    { value: '09', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' }
  ];

  const quarterOptions = [
    { value: 'Q1', label: '1. Çeyrek (Ocak-Mart)' },
    { value: 'Q2', label: '2. Çeyrek (Nisan-Haziran)' },
    { value: 'Q3', label: '3. Çeyrek (Temmuz-Eylül)' },
    { value: 'Q4', label: '4. Çeyrek (Ekim-Aralık)' }
  ];

  // Advanced filtering function
  const getFilteredData = () => {
    return testRecords.filter(test => {
      // Genel arama (eski sistem ile uyumluluk için)
      if (searchTerm && !filters.searchTerm) {
        const matchesGeneralSearch = 
      test.testNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.productInfo.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.productInfo.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.operator.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesGeneralSearch) return false;
      }

      // Yeni gelişmiş arama sistemi
      if (filters.searchTerm && !(
        test.testNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        test.productInfo.serialNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        test.productInfo.customer.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        test.operator.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )) {
        return false;
      }

      // Seri numarası filtresi
      if (filters.serialNumber && !test.productInfo.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase())) {
        return false;
      }

      // Ürün tipi filtresi
      if (filters.productType && test.productInfo.productType !== filters.productType) {
        return false;
      }

      // Durum filtresi
      if (filters.status && test.status !== filters.status) {
        return false;
      }

      // Sonuç filtresi
      if (filters.result && test.overallResult !== filters.result) {
        return false;
      }

      // Operatör filtresi
      if (filters.operator && !test.operator.toLowerCase().includes(filters.operator.toLowerCase())) {
        return false;
      }

      // Müşteri filtresi
      if (filters.customer && !test.productInfo.customer.toLowerCase().includes(filters.customer.toLowerCase())) {
        return false;
      }

      // Eski filtreleme sistemi ile uyumluluk
      if (filterProduct !== 'all' && test.productInfo.productType !== filterProduct) {
        return false;
      }

      if (filterStatus !== 'all' && test.status !== filterStatus) {
        return false;
      }

      // Tarih filtreleri
      const testDate = new Date(test.testDate);
      
      // Dönem filtreleri
      if (filters.period === 'monthly' && filters.year && filters.month) {
        const filterYear = parseInt(filters.year);
        const filterMonth = parseInt(filters.month);
        if (testDate.getFullYear() !== filterYear || testDate.getMonth() + 1 !== filterMonth) {
          return false;
        }
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        const filterYear = parseInt(filters.year);
        const testYear = testDate.getFullYear();
        const testMonth = testDate.getMonth() + 1;
        
        if (testYear !== filterYear) return false;
        
        const quarter = filters.quarter;
        if (quarter === 'Q1' && !(testMonth >= 1 && testMonth <= 3)) return false;
        if (quarter === 'Q2' && !(testMonth >= 4 && testMonth <= 6)) return false;
        if (quarter === 'Q3' && !(testMonth >= 7 && testMonth <= 9)) return false;
        if (quarter === 'Q4' && !(testMonth >= 10 && testMonth <= 12)) return false;
      } else if (filters.period === 'custom') {
        if (filters.dateFrom && testDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && testDate > new Date(filters.dateTo)) return false;
      }

      return true;
    });
  };

  // Filtered tests
  const filteredTests = getFilteredData();

  const openDialog = (type: 'view' | 'edit', test: TestRecord) => {
    if (type === 'view') {
      setSelectedTestForView(test);
      setViewDialogOpen(true);
    } else if (type === 'edit') {
      setSelectedTestForEdit(test);
      setEditDialogOpen(true);
    }
  };

  const handleDownloadReport = (test: TestRecord) => {
    try {
      // Create PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Function to convert Turkish characters to ASCII equivalents for PDF compatibility
      const turkishToAscii = (text: string): string => {
        return text
          .replace(/ç/g, 'c').replace(/Ç/g, 'C')
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U');
      };

      // Header section
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Company info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text(turkishToAscii('KADEME A.S.'), 20, 15);
      doc.setFontSize(14);
      doc.text(turkishToAscii('FAN BALANS VE KALITE KONTROL RAPORU'), 20, 25);
      doc.setFontSize(10);
      doc.text(turkishToAscii('ISO 1940 Standardina Uygun Test Raporu'), 20, 32);
      
      // Date and report info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('tr-TR');
      const currentTime = new Date().toLocaleTimeString('tr-TR');
      doc.text(turkishToAscii(`Rapor Tarihi: ${currentDate} ${currentTime}`), 140, 50);
      doc.text(turkishToAscii(`Rapor No: ${test.testNumber}`), 140, 57);

      let yPosition = 70;

      // Utility function to add section with auto page break
      const addSection = (title: string, data: string[][], headerColor: [number, number, number]) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(15, yPosition - 5, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(turkishToAscii(title), 20, yPosition);
        doc.setTextColor(0, 0, 0);
        
        yPosition += 15;

        // Convert data to ASCII
        const asciiData = data.map(row => [
          turkishToAscii(row[0]),
          turkishToAscii(row[1] || '')
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [[turkishToAscii('Parametre'), turkishToAscii('Deger')]],
          body: asciiData,
          theme: 'grid',
          headStyles: { fillColor: headerColor as [number, number, number], textColor: 255, fontSize: 9 },
          styles: { 
            fontSize: 8,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 70, fontStyle: 'bold' },
            1: { cellWidth: 110 }
          },
          margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      };

      // 1. Basic Test Information
      const basicInfo = [
        ['Test Numarasi', test.testNumber],
        ['Seri Numarasi', test.productInfo.serialNumber],
        ['Musteri', test.productInfo.customer],
        ['Urun Tipi', PRODUCT_TYPES.find(t => t.value === test.productInfo.productType)?.label || ''],
        ['Cap (mm)', test.productInfo.diameter.toString()],
        ['Test Tarihi', new Date(test.testDate).toLocaleDateString('tr-TR')],
        ['Operator', test.operator],
        ['Test Durumu', test.status === 'completed' ? 'Tamamlandi' : 
                       test.status === 'in_progress' ? 'Devam Ediyor' : 
                       test.status === 'planning' ? 'Planlama' : 'Basarisiz'],
      ];
      addSection('TEMEL BILGILER', basicInfo, [63, 81, 181]);

      // 2. Fan Technical Information (from formData if available)
      const fanTechnicalInfo = [
        ['Fan Model/Tip', 'FAN-450-HTR'], // Mock data - would come from formData
        ['Nominal Devir (RPM)', '1450'],
        ['Test Devri (RPM)', '1450'],
        ['Kanat Sayisi', '8'],
        ['Motor Gucu (kW)', '15'],
        ['Hava Debisi (m³/h)', '5000'],
        ['Basinc (Pa)', '500'],
        ['Rotor Agirligi (kg)', '25.5'],
        ['Rotor Tipi', 'Rijit Rotor'],
      ];
      addSection('FAN TEKNIK BILGILERI', fanTechnicalInfo, [33, 150, 243]);

      // 3. Rotor and Bearing Information
      const rotorBearingInfo = [
        ['Yatak Tipi', 'SKF 6309'],
        ['Yatak Acikligi (mm)', '300'],
        ['Overhang (mm)', '50'],
        ['Kritik Hiz (RPM)', '2100'],
        ['Calisma Hizi (RPM)', '1450'],
      ];
      addSection('ROTOR VE YATAK BILGILERI', rotorBearingInfo, [156, 39, 176]);

      // 4. Initial Vibration Measurements
      const initialVibration = [
        ['A Düzlemi Titresim (μm)', '25.0'],
        ['B Düzlemi Titresim (μm)', '20.0'],
        ['A Düzlemi Faz (°)', '45'],
        ['B Düzlemi Faz (°)', '120'],
        ['Baseline Kabul Edilebilir mi?', 'Evet'],
      ];
      addSection('ILK TITRESIM OLCUMLERI (Test Oncesi)', initialVibration, [244, 67, 54]);

      // 5. Balance Test Parameters
      const balanceParams = [
        ['Balans Sinifi', 'G6.3 (Standart Fan)'],
        ['Test Standardi', 'ISO 1940'],
        ['Izin Verilen Dengesizlik (g·mm)', '127.5'],
        ['Test Hizi (RPM)', '1450'],
        ['Olcum Düzlemi Sayisi', 'Cift Düzlem'],
      ];
      addSection('BALANS TEST PARAMETRELERI', balanceParams, [255, 193, 7]);

      // 6. Balance Weight Information - Plane 1
      const balanceWeightPlane1 = [
        ['Trial Agirlik (gram)', '10.5'],
        ['Trial Aci (°)', '90'],
        ['Trial Yaricap (mm)', '150'],
        ['Düzeltme Agirligi (gram)', '8.2'],
        ['Düzeltme Acisi (°)', '75'],
        ['Düzeltme Yaricapi (mm)', '150'],
      ];
      addSection('BALANS AGIRLIGI - 1. DUZLEM (A)', balanceWeightPlane1, [255, 152, 0]);

      // 7. Balance Weight Information - Plane 2
      const balanceWeightPlane2 = [
        ['Trial Agirlik (gram)', '12.0'],
        ['Trial Aci (°)', '270'],
        ['Trial Yaricap (mm)', '150'],
        ['Düzeltme Agirligi (gram)', '9.8'],
        ['Düzeltme Acisi (°)', '245'],
        ['Düzeltme Yaricapi (mm)', '150'],
      ];
      addSection('BALANS AGIRLIGI - 2. DUZLEM (B)', balanceWeightPlane2, [255, 152, 0]);

      // 8. Final Vibration Measurements
      const finalVibration = [
        ['A Düzlemi Final Titresim (μm)', '3.2'],
        ['B Düzlemi Final Titresim (μm)', '2.8'],
        ['A Düzlemi Final Faz (°)', '85'],
        ['B Düzlemi Final Faz (°)', '195'],
        ['A Düzlemi Iyilestirme Orani (%)', '87.2'],
        ['B Düzlemi Iyilestirme Orani (%)', '86.0'],
      ];
      addSection('FINAL TITRESIM OLCUMLERI (Test Sonrasi)', finalVibration, [76, 175, 80]);

      // 9. Tolerance and Acceptance Criteria
      const toleranceAcceptance = [
        ['Hedef Titresim (μm)', '6.3'],
        ['Elde Edilen Titresim (μm)', '3.0'],
        ['Residual Unbalance (gmm)', '1350.2'],
        ['Tolerans Kontrolu', 'BASARILI'],
        ['Kabul Kriterleri', 'ISO 1940 G6.3'],
      ];
      addSection('TOLERANS VE KABUL KRITERLERI', toleranceAcceptance, [63, 81, 181]);

      // 10. Environmental Conditions
      const environmentalConditions = [
        ['Sicaklik (°C)', '20'],
        ['Nem (%)', '50'],
        ['Atmosferik Basinc (hPa)', '1013'],
      ];
      addSection('CEVRESEL KOSULLAR', environmentalConditions, [0, 150, 136]);

      // 11. Test Equipment
      const testEquipment = [
        ['Balans Makinesi', 'Schenck HM20'],
        ['Titresim Sensoru', 'Accelerometer PCB 352C33'],
        ['Son Kalibrasyon Tarihi', new Date().toLocaleDateString('tr-TR')],
        ['Yazilim Versiyonu', 'BalanceView v3.2.1'],
      ];
      addSection('TEST EKIPMANLARI', testEquipment, [76, 175, 80]);

      // 12. Test Management
      const testManagement = [
        ['Test Proseduru', 'Standart Prosedur'],
        ['Dokumantasyon Seviyesi', 'Tam Rapor'],
        ['Kalite Mufettisi', 'Ismail Kaya'],
        ['Onay Durumu', 'Onaylandi'],
      ];
      addSection('TEST YONETIMI', testManagement, [103, 58, 183]);

      // Balance and Welding Test Results (existing data)
      if (test.balanceTest) {
        const balanceResults = [
          ['Dengesizlik Miktari', `${test.balanceTest.unbalanceAmount} g·mm`],
          ['Balans Sinifi', test.balanceTest.balanceGrade],
          ['Test Sonucu', test.balanceTest.passed ? 'BASARILI' : 'BASARISIZ'],
          ['Standart', 'ISO 1940'],
        ];
        addSection('BALANS TEST SONUCLARI', balanceResults, [76, 175, 80]);
      }

      if (test.weldingInspection) {
        const weldingResults = [
          ['Kalite Seviyesi', test.weldingInspection.overallGrade],
          ['Test Sonucu', test.weldingInspection.passed ? 'BASARILI' : 'BASARISIZ'],
          ['Standart', 'ISO 5817'],
        ];
        addSection('KAYNAK KALITE KONTROL SONUCLARI', weldingResults, [255, 152, 0]);
      }

      // Overall Result Section
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(
        test.overallResult === 'pass' ? 76 : test.overallResult === 'conditional' ? 255 : 244, 
        test.overallResult === 'pass' ? 175 : test.overallResult === 'conditional' ? 193 : 67, 
        test.overallResult === 'pass' ? 80 : test.overallResult === 'conditional' ? 7 : 54
      );
      doc.rect(15, yPosition, 180, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const resultText = test.overallResult === 'pass' ? 'TEST SONUCU: BASARILI' : 
                        test.overallResult === 'conditional' ? 'TEST SONUCU: KOSULLU' : 
                        'TEST SONUCU: BASARISIZ';
      doc.text(turkishToAscii(resultText), 105, yPosition + 9, { align: 'center' });

      // Certificate section
      yPosition += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(turkishToAscii(`Sertifika Durumu: ${test.certificateIssued ? 'Sertifika Verildi' : 'Sertifika Beklemede'}`), 20, yPosition);

      // Footer section
      yPosition += 20;
      doc.setFillColor(230, 230, 230);
      doc.rect(15, yPosition, 180, 25, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(turkishToAscii('IMZA VE ONAY'), 20, yPosition + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(turkishToAscii('Test Operatoru:'), 25, yPosition + 15);
      doc.text(turkishToAscii(test.operator), 25, yPosition + 20);
      doc.text(turkishToAscii('Kalite Kontrol:'), 95, yPosition + 15);
      doc.text('..............................', 95, yPosition + 20);
      doc.text(turkishToAscii('Mudur Onayi:'), 140, yPosition + 15);
      doc.text('..............................', 140, yPosition + 20);

      // Page numbers (add to all pages)
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(turkishToAscii(`Sayfa ${i}/${pageCount}`), 185, 290);
        doc.text(turkishToAscii('Bu rapor KADEME A.S. tarafindan hazirlanmistir.'), 105, 285, { align: 'center' });
      }

      // Save the PDF
      doc.save(`${test.testNumber}_Fan_Balans_Raporu.pdf`);

      setShowSuccess(`${test.testNumber} PDF raporu başarıyla indirildi!`);
      setTimeout(() => setShowSuccess(''), 3000);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      setShowSuccess('PDF oluşturulurken bir hata oluştu!');
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleSaveTest = (updatedTest: TestRecord) => {
    setTestRecords(prev => 
      prev.map(test => 
        test.id === updatedTest.id ? updatedTest : test
      )
    );
    setEditDialogOpen(false);
    setSelectedTestForEdit(null);
    setShowSuccess('Test başarıyla güncellendi!');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleDeleteTest = (testId: string) => {
    // Test silme onayı kaldırıldı - sessiz silme
    if (true) {
      setTestRecords(prev => prev.filter(test => test.id !== testId));
      setShowSuccess('Test başarıyla silindi!');
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  // ✅ DÖF/8D Integration Functions
  const handleCreateDOFForTest = (test: TestRecord) => {
    const dofParams: DOFCreationParams = {
      sourceModule: 'fanTest',
      recordId: test.id,
      recordData: test,
      issueType: test.overallResult === 'fail' ? 'nonconformity' : 'defect',
      issueDescription: `Fan ve balans kalite analizinde uygunsuzluk tespit edildi.\n\nTest Bilgileri:\n- Test Numarası: ${test.testNumber}\n- Ürün Türü: ${test.productInfo.productType}\n- Seri Numarası: ${test.productInfo.serialNumber}\n- Çap: ${test.productInfo.diameter}mm\n- Müşteri: ${test.productInfo.customer}\n- Test Tarihi: ${new Date(test.testDate).toLocaleDateString('tr-TR')}\n- Operatör: ${test.operator}\n- Genel Sonuç: ${test.overallResult}\n\nTest Sonuçları:\n${test.balanceTest ? `- Dengesizlik Miktarı: ${test.balanceTest.unbalanceAmount}\n- Balans Sınıfı: ${test.balanceTest.balanceGrade}\n- Balans Testi: ${test.balanceTest.passed ? 'Geçti' : 'Başarısız'}` : ''}\n${test.weldingInspection ? `- Kaynak Muayene Derecesi: ${test.weldingInspection.overallGrade}\n- Kaynak Muayene: ${test.weldingInspection.passed ? 'Geçti' : 'Başarısız'}` : ''}\n\nBu uygunsuzluk için kök neden analizi ve düzeltici faaliyet planı gereklidir.`,
      priority: test.overallResult === 'fail' ? 'critical' : test.overallResult === 'conditional' ? 'high' : 'medium',
      affectedDepartment: test.productInfo.productType.includes('rusya') ? 'Rusya Projesi' : test.productInfo.productType.includes('kompakt') ? 'Kompakt Üretim' : 'Fan Üretim',
      responsiblePerson: test.operator
    };

    // DÖF/8D yönetimi sayfasına yönlendir
    const dofUrl = navigateToDOFForm(dofParams);
    window.location.href = dofUrl;
  };

  const getDOFStatusForTest = (test: TestRecord) => {
    return checkDOFStatus('fanTest', test.id);
  };

  return (
    <Container maxWidth={false}>
      {/* Advanced Filtering System */}
      <StyledAccordion 
        expanded={filterExpanded} 
        onChange={(_, isExpanded) => setFilterExpanded(isExpanded)}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 2
            }
          }}
        >
          <FilterAltIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filtreleme ve Arama
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Genel Arama */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Genel Arama"
                placeholder="Test no, seri no, müşteri, operatör..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Seri Numarası */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seri Numarası"
                value={filters.serialNumber}
                onChange={(e) => setFilters({...filters, serialNumber: e.target.value})}
              />
            </Grid>

            {/* Ürün Türü */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ürün Türü</InputLabel>
                <Select
                  value={filters.productType}
                  onChange={(e) => setFilters({...filters, productType: e.target.value})}
                  label="Ürün Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {PRODUCT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Test Durumu */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Test Durumu</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  label="Test Durumu"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="planning">Planlama</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                  <MenuItem value="failed">Başarısız</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Test Sonucu */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Test Sonucu</InputLabel>
                <Select
                  value={filters.result}
                  onChange={(e) => setFilters({...filters, result: e.target.value})}
                  label="Test Sonucu"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="pass">Başarılı</MenuItem>
                  <MenuItem value="conditional">Koşullu</MenuItem>
                  <MenuItem value="fail">Başarısız</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Operatör */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Operatör"
                value={filters.operator}
                onChange={(e) => setFilters({...filters, operator: e.target.value})}
              />
            </Grid>

            {/* Müşteri */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Müşteri"
                value={filters.customer}
                onChange={(e) => setFilters({...filters, customer: e.target.value})}
              />
            </Grid>

            {/* Dönem Seçimi */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Dönem</InputLabel>
                <Select
                  value={filters.period}
                  onChange={(e) => setFilters({...filters, period: e.target.value})}
                  label="Dönem"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {periodOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Yıl Seçimi */}
            {filters.period && filters.period !== 'custom' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    label="Yıl"
                  >
                    {yearOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Ay Seçimi */}
            {filters.period === 'monthly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Ay</InputLabel>
                  <Select
                    value={filters.month}
                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                    label="Ay"
                  >
                    <MenuItem value="">Tüm Aylar</MenuItem>
                    {monthOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Çeyrek Seçimi */}
            {filters.period === 'quarterly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Çeyrek</InputLabel>
                  <Select
                    value={filters.quarter}
                    onChange={(e) => setFilters({...filters, quarter: e.target.value})}
                    label="Çeyrek"
                  >
                    <MenuItem value="">Tüm Çeyrekler</MenuItem>
                    {quarterOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Özel Tarih Aralığı */}
            {filters.period === 'custom' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Başlangıç Tarihi"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bitiş Tarihi"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Filter Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({
                      serialNumber: '',
                      productType: '',
                      status: '',
                      result: '',
                      dateFrom: '',
                      dateTo: '',
                      searchTerm: '',
                      operator: '',
                      period: '',
                      year: new Date().getFullYear().toString(),
                      month: '',
                      quarter: '',
                      customer: ''
                    });
                    // Eski sistem de temizlenir
                    setFilterProduct('all');
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                  startIcon={<ClearIcon />}
                >
                  Filtreleri Temizle
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setFilterExpanded(false)}
                  startIcon={<FilterAltIcon />}
                >
                  Filtrele
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </StyledAccordion>

      {/* Compatibility - Old Simple Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Test No/Seri No/Müşteri ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Ürün Tipi</InputLabel>
          <Select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}>
            <MenuItem value="all">Tümü</MenuItem>
            {PRODUCT_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Durum</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="planning">Planlama</MenuItem>
            <MenuItem value="in_progress">Devam Ediyor</MenuItem>
            <MenuItem value="completed">Tamamlandı</MenuItem>
            <MenuItem value="failed">Başarısız</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tests Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test No</TableCell>
                <TableCell>Ürün Bilgisi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Sonuç</TableCell>
                <TableCell>Test Tarihi</TableCell>
                <TableCell>Operatör</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {test.testNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {test.productInfo.customer}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {test.productInfo.serialNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {PRODUCT_TYPES.find(t => t.value === test.productInfo.productType)?.label} - Ø{test.productInfo.diameter}mm
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip label={getStatusLabel(test.status)} status={test.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <ResultChip label={getResultLabel(test.overallResult)} result={test.overallResult} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(test.testDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>{test.operator}</TableCell>
                                                        <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Görüntüle">
                        <IconButton 
                          size="small" 
                          onClick={() => openDialog('view', test)}
                          sx={{ color: 'primary.main' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          onClick={() => openDialog('edit', test)}
                          sx={{ color: 'warning.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rapor İndir">
                        <IconButton 
                          size="small"
                          onClick={() => handleDownloadReport(test)}
                          sx={{ color: 'success.main' }}
                        >
                          <PdfIcon />
                        </IconButton>
                      </Tooltip>
                      {/* DÖF Oluştur butonu - fail veya conditional için */}
                      {(test.overallResult === 'fail' || test.overallResult === 'conditional') && (
                        <Tooltip title={getDOFStatusForTest(test) ? `DÖF Mevcut: ${getDOFStatusForTest(test)?.dofNumber}` : "Uygunsuzluk Oluştur"}>
                          <IconButton 
                            size="small"
                            onClick={() => handleCreateDOFForTest(test)}
                            disabled={!!getDOFStatusForTest(test)}
                            sx={{ 
                              color: getDOFStatusForTest(test) ? 'success.main' : 'error.main',
                              '&:disabled': { color: 'success.main' }
                            }}
                          >
                            <ReportIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
                  </TableContainer>
      </Paper>

      {/* Success Alert */}
      {showSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {showSuccess}
        </Alert>
      )}

      {/* View Test Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon color="primary" />
            Test Detayları: {selectedTestForView?.testNumber}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTestForView && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Temel Bilgiler
                </Typography>
                <Typography><strong>Test No:</strong> {selectedTestForView.testNumber}</Typography>
                <Typography><strong>Seri No:</strong> {selectedTestForView.productInfo.serialNumber}</Typography>
                <Typography><strong>Müşteri:</strong> {selectedTestForView.productInfo.customer}</Typography>
                <Typography><strong>Ürün Tipi:</strong> {PRODUCT_TYPES.find(t => t.value === selectedTestForView.productInfo.productType)?.label}</Typography>
                <Typography><strong>Çap:</strong> {selectedTestForView.productInfo.diameter}mm</Typography>
                <Typography><strong>Test Tarihi:</strong> {new Date(selectedTestForView.testDate).toLocaleDateString('tr-TR')}</Typography>
                <Typography><strong>Operatör:</strong> {selectedTestForView.operator}</Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="secondary" gutterBottom>
                  Test Sonuçları
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Durum:</strong></Typography>
                  <StatusChip label={getStatusLabel(selectedTestForView.status)} status={selectedTestForView.status} size="small" sx={{ ml: 1 }} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Sonuç:</strong></Typography>
                  <ResultChip label={getResultLabel(selectedTestForView.overallResult)} result={selectedTestForView.overallResult} size="small" sx={{ ml: 1 }} />
                </Box>
                
                {selectedTestForView.balanceTest && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary">Balans Testi:</Typography>
                    <Typography>• Dengesizlik: {selectedTestForView.balanceTest.unbalanceAmount} g·mm</Typography>
                    <Typography>• Balans Sınıfı: {selectedTestForView.balanceTest.balanceGrade}</Typography>
                    <Typography>• Sonuç: {selectedTestForView.balanceTest.passed ? '✓ Başarılı' : '✗ Başarısız'}</Typography>
                  </Box>
                )}
                
                {selectedTestForView.weldingInspection && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="secondary">Kaynak Kontrolü:</Typography>
                    <Typography>• Kalite Seviyesi: {selectedTestForView.weldingInspection.overallGrade}</Typography>
                    <Typography>• Sonuç: {selectedTestForView.weldingInspection.passed ? '✓ Başarılı' : '✗ Başarısız'}</Typography>
                  </Box>
                )}
                
                <Typography>
                  <strong>Sertifika:</strong> {selectedTestForView.certificateIssued ? '✓ Verildi' : '⏳ Beklemede'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
          {selectedTestForView && (
            <Button 
              variant="contained" 
              startIcon={<PdfIcon />}
              onClick={() => {
                handleDownloadReport(selectedTestForView);
                setViewDialogOpen(false);
              }}
            >
              Rapor İndir
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="warning" />
            Test Düzenle: {selectedTestForEdit?.testNumber}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTestForEdit && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={selectedTestForEdit.status}
                  onChange={(e) => setSelectedTestForEdit({
                    ...selectedTestForEdit,
                    status: e.target.value as TestRecord['status']
                  })}
                  label="Durum"
                >
                  <MenuItem value="planning">Planlama</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                  <MenuItem value="failed">Başarısız</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Sonuç</InputLabel>
                <Select
                  value={selectedTestForEdit.overallResult}
                  onChange={(e) => setSelectedTestForEdit({
                    ...selectedTestForEdit,
                    overallResult: e.target.value as TestRecord['overallResult']
                  })}
                  label="Sonuç"
                >
                  <MenuItem value="pass">Başarılı</MenuItem>
                  <MenuItem value="conditional">Koşullu</MenuItem>
                  <MenuItem value="fail">Başarısız</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Operatör"
                value={selectedTestForEdit.operator}
                onChange={(e) => setSelectedTestForEdit({
                  ...selectedTestForEdit,
                  operator: e.target.value
                })}
              />

              <TextField
                fullWidth
                label="Test Tarihi"
                type="date"
                value={selectedTestForEdit.testDate}
                onChange={(e) => setSelectedTestForEdit({
                  ...selectedTestForEdit,
                  testDate: e.target.value
                })}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Sertifika Durumu</InputLabel>
                <Select
                  value={selectedTestForEdit.certificateIssued ? 'issued' : 'pending'}
                  onChange={(e) => setSelectedTestForEdit({
                    ...selectedTestForEdit,
                    certificateIssued: e.target.value === 'issued'
                  })}
                  label="Sertifika Durumu"
                >
                  <MenuItem value="pending">Beklemede</MenuItem>
                  <MenuItem value="issued">Verildi</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={() => selectedTestForEdit && handleSaveTest(selectedTestForEdit)}
            color="primary"
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Test Creation Component
const TestCreation: React.FC = () => {
  const context = useContext(TestContext);
  if (!context) throw new Error('TestCreation must be used within TestProvider');
  
  const { testRecords, setTestRecords } = context;
  
  // Form state
  const [formData, setFormData] = useState({
    // Temel Bilgiler
    productType: '',
    serialNumber: '',
    customer: '',
    operator: '',
    testDate: new Date().toISOString().split('T')[0],
    workOrder: '',
    priority: 'normal',
    
    // Fan Teknik Bilgileri
    fanModel: '',
    diameter: '',
    rpmNominal: '',
    rpmTest: '',
    bladeCount: '',
    motorPower: '',
    airFlow: '',
    pressure: '',
    weight: '',
    rotorType: 'rigid',
    
    // Rotor ve Bearing Bilgileri
    bearingType: '',
    bearingSpan: '',
    overhang: '',
    criticalSpeed: '',
    operatingSpeed: '',
    
    // İlk Titreşim Ölçümleri (Test Öncesi)
    initialVibrationA: '',
    initialVibrationB: '',
    initialPhaseA: '',
    initialPhaseB: '',
    baselineAcceptable: 'yes',
    
    // Balans Test Parametreleri
    balanceClass: 'G6.3',
    testStandard: 'ISO_1940',
    allowableUnbalance: '',
    testSpeed: '',
    measuringPlanes: '2',
    
    // Balans Ağırlık Bilgileri - 1. Düzlem
    plane1TrialWeight: '',
    plane1TrialAngle: '',
    plane1TrialRadius: '',
    plane1CorrectionWeight: '',
    plane1CorrectionAngle: '',
    plane1CorrectionRadius: '',
    
    // Balans Ağırlık Bilgileri - 2. Düzlem
    plane2TrialWeight: '',
    plane2TrialAngle: '',
    plane2TrialRadius: '',
    plane2CorrectionWeight: '',
    plane2CorrectionAngle: '',
    plane2CorrectionRadius: '',
    
    // Final Titreşim Ölçümleri (Test Sonrası)
    finalVibrationA: '',
    finalVibrationB: '',
    finalPhaseA: '',
    finalPhaseB: '',
    improvementRatioA: '',
    improvementRatioB: '',
    
    // Tolerans ve Kabul Kriterleri
    targetVibration: '',
    achievedVibration: '',
    residualUnbalance: '',
    toleranceCheck: '',
    acceptanceCriteria: 'ISO_1940_G6.3',
    
    // Çevresel Koşullar
    temperature: '',
    humidity: '',
    atmosphericPressure: '',
    
    // Test Ekipmanları
    balancingMachine: '',
    vibrationSensor: '',
    calibrationDate: '',
    softwareVersion: '',
    
    // İş Emri ve Kalite
    customerRequirements: '',
    testProcedure: 'standard',
    documentationLevel: 'full',
    qualityInspector: '',
    approvalStatus: 'pending',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-calculation functions
  const calculateAllowableUnbalance = (balanceClass: string, weight: string, diameter: string) => {
    if (!weight || !diameter) return '';
    
    const weightKg = parseFloat(weight);
    const diameterMm = parseFloat(diameter);
    const radiusMm = diameterMm / 2;
    
    // Balans sınıfına göre ebal değeri (mm/s)
    const ebalValues: { [key: string]: number } = {
      'G2.5': 2.5,
      'G6.3': 6.3,
      'G16': 16,
      'G40': 40
    };
    
    const ebal = ebalValues[balanceClass] || 6.3;
    
    // İzin verilen dengesizlik = (ebal × ağırlık × 1000) / omega
    // omega = (2 × π × RPM) / 60, ancak basitleştirme için ebal × weight × radius / 1000 kullanıyoruz
    const allowableUnbalance = (ebal * weightKg * radiusMm) / 1000;
    
    return allowableUnbalance.toFixed(1);
  };

  const calculateTargetVibration = (acceptanceCriteria: string) => {
    const targetValues: { [key: string]: string } = {
      'ISO_1940_G2.5': '2.5',
      'ISO_1940_G6.3': '6.3',
      'ISO_1940_G16': '16',
      'ISO_1940_G40': '40',
      'custom': ''
    };
    
    return targetValues[acceptanceCriteria] || '';
  };

  const calculateImprovementRatio = (initial: string, final: string) => {
    if (!initial || !final) return '';
    
    const initialVal = parseFloat(initial);
    const finalVal = parseFloat(final);
    
    if (initialVal === 0) return '';
    
    const improvement = ((initialVal - finalVal) / initialVal) * 100;
    return Math.max(0, improvement).toFixed(1);
  };

  const calculateResidualUnbalance = (correctionWeight1: string, correctionWeight2: string, radius: string) => {
    if (!correctionWeight1 && !correctionWeight2) return '';
    
    const weight1 = parseFloat(correctionWeight1) || 0;
    const weight2 = parseFloat(correctionWeight2) || 0;
    const radiusVal = parseFloat(radius) || 150; // Default radius
    
    // Residual unbalance = √(W1² + W2²) × radius
    const totalWeight = Math.sqrt(weight1 * weight1 + weight2 * weight2);
    const residual = totalWeight * radiusVal;
    
    return residual.toFixed(1);
  };

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-calculations based on field changes
      if (field === 'balanceClass' || field === 'weight' || field === 'diameter') {
        const allowable = calculateAllowableUnbalance(
          field === 'balanceClass' ? value : prev.balanceClass,
          field === 'weight' ? value : prev.weight,
          field === 'diameter' ? value : prev.diameter
        );
        if (allowable) {
          newData.allowableUnbalance = allowable;
        }
      }

      // Auto-set target vibration based on acceptance criteria
      if (field === 'acceptanceCriteria') {
        const target = calculateTargetVibration(value);
        if (target) {
          newData.targetVibration = target;
        }
      }

      // Auto-calculate test speed from nominal RPM
      if (field === 'rpmNominal') {
        newData.testSpeed = value;
        newData.operatingSpeed = value;
      }

      // Auto-calculate improvement ratios
      if (field === 'initialVibrationA' || field === 'finalVibrationA') {
        const ratio = calculateImprovementRatio(
          field === 'initialVibrationA' ? value : prev.initialVibrationA,
          field === 'finalVibrationA' ? value : prev.finalVibrationA
        );
        if (ratio) {
          newData.improvementRatioA = ratio;
        }
      }

      if (field === 'initialVibrationB' || field === 'finalVibrationB') {
        const ratio = calculateImprovementRatio(
          field === 'initialVibrationB' ? value : prev.initialVibrationB,
          field === 'finalVibrationB' ? value : prev.finalVibrationB
        );
        if (ratio) {
          newData.improvementRatioB = ratio;
        }
      }

      // Auto-check tolerance based on achieved vs target vibration
      if (field === 'achievedVibration' || field === 'targetVibration') {
        const achieved = parseFloat(field === 'achievedVibration' ? value : prev.achievedVibration);
        const target = parseFloat(field === 'targetVibration' ? value : prev.targetVibration);
        
        if (!isNaN(achieved) && !isNaN(target)) {
          if (achieved <= target) {
            newData.toleranceCheck = 'passed';
          } else if (achieved <= target * 1.1) {
            newData.toleranceCheck = 'marginal';
          } else {
            newData.toleranceCheck = 'failed';
          }
        }
      }

      // Auto-set correction radius same as trial radius
      if (field === 'plane1TrialRadius') {
        newData.plane1CorrectionRadius = value;
      }
      if (field === 'plane2TrialRadius') {
        newData.plane2CorrectionRadius = value;
      }

      // Auto-calculate residual unbalance
      if (field === 'plane1CorrectionWeight' || field === 'plane2CorrectionWeight' || field === 'plane1CorrectionRadius') {
        const residual = calculateResidualUnbalance(
          field === 'plane1CorrectionWeight' ? value : prev.plane1CorrectionWeight,
          field === 'plane2CorrectionWeight' ? value : prev.plane2CorrectionWeight,
          field === 'plane1CorrectionRadius' ? value : prev.plane1CorrectionRadius
        );
        if (residual) {
          newData.residualUnbalance = residual;
        }
      }

      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Temel Bilgiler
    if (!formData.productType) newErrors.productType = 'Ürün tipi seçiniz';
    if (!formData.serialNumber) newErrors.serialNumber = 'Seri numarası gerekli';
    if (!formData.customer) newErrors.customer = 'Müşteri bilgisi gerekli';
    if (!formData.operator) newErrors.operator = 'Operatör bilgisi gerekli';
    
    // Fan Teknik Bilgileri
    if (!formData.fanModel) newErrors.fanModel = 'Fan model bilgisi gerekli';
    if (!formData.diameter) newErrors.diameter = 'Çap bilgisi gerekli';
    if (!formData.rpmNominal) newErrors.rpmNominal = 'Nominal devir sayısı gerekli';
    if (!formData.bladeCount) newErrors.bladeCount = 'Kanat sayısı gerekli';
    if (!formData.weight) newErrors.weight = 'Rotor ağırlığı gerekli';
    
    // Test Parametreleri
    if (!formData.testSpeed) newErrors.testSpeed = 'Test hızı gerekli';
    if (!formData.allowableUnbalance) newErrors.allowableUnbalance = 'İzin verilen dengesizlik gerekli';
    
    // Balans Düzlem Kontrolü
    if (formData.measuringPlanes === '2') {
      if (!formData.plane1TrialWeight && !formData.plane2TrialWeight) {
        newErrors.plane1TrialWeight = 'En az bir düzlem için trial ağırlık gerekli';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTestNumber = () => {
    const year = new Date().getFullYear();
    const count = testRecords.length + 1;
    return `FT-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleCreateTest = () => {
    if (!validateForm()) return;

    const newTest: TestRecord = {
      id: `TEST${Date.now()}`,
      testNumber: generateTestNumber(),
      productInfo: {
        productType: formData.productType,
        serialNumber: formData.serialNumber,
        diameter: parseInt(formData.diameter),
        customer: formData.customer,
      },
      testDate: formData.testDate,
      operator: formData.operator,
      status: 'planning',
      overallResult: 'pass', // Default value
      certificateIssued: false,
    };

    setTestRecords(prev => [...prev, newTest]);
    
    // Reset form
    setFormData({
      // Temel Bilgiler
      productType: '',
      serialNumber: '',
      customer: '',
      operator: '',
      testDate: new Date().toISOString().split('T')[0],
      workOrder: '',
      priority: 'normal',
      
      // Fan Teknik Bilgileri
      fanModel: '',
      diameter: '',
      rpmNominal: '',
      rpmTest: '',
      bladeCount: '',
      motorPower: '',
      airFlow: '',
      pressure: '',
      weight: '',
      rotorType: 'rigid',
      
      // Rotor ve Bearing Bilgileri
      bearingType: '',
      bearingSpan: '',
      overhang: '',
      criticalSpeed: '',
      operatingSpeed: '',
      
      // İlk Titreşim Ölçümleri (Test Öncesi)
      initialVibrationA: '',
      initialVibrationB: '',
      initialPhaseA: '',
      initialPhaseB: '',
      baselineAcceptable: 'yes',
      
      // Balans Test Parametreleri
      balanceClass: 'G6.3',
      testStandard: 'ISO_1940',
      allowableUnbalance: '',
      testSpeed: '',
      measuringPlanes: '2',
      
      // Balans Ağırlık Bilgileri - 1. Düzlem
      plane1TrialWeight: '',
      plane1TrialAngle: '',
      plane1TrialRadius: '',
      plane1CorrectionWeight: '',
      plane1CorrectionAngle: '',
      plane1CorrectionRadius: '',
      
      // Balans Ağırlık Bilgileri - 2. Düzlem
      plane2TrialWeight: '',
      plane2TrialAngle: '',
      plane2TrialRadius: '',
      plane2CorrectionWeight: '',
      plane2CorrectionAngle: '',
      plane2CorrectionRadius: '',
      
      // Final Titreşim Ölçümleri (Test Sonrası)
      finalVibrationA: '',
      finalVibrationB: '',
      finalPhaseA: '',
      finalPhaseB: '',
      improvementRatioA: '',
      improvementRatioB: '',
      
      // Tolerans ve Kabul Kriterleri
      targetVibration: '',
      achievedVibration: '',
      residualUnbalance: '',
      toleranceCheck: '',
      acceptanceCriteria: 'ISO_1940_G6.3',
      
      // Çevresel Koşullar
      temperature: '',
      humidity: '',
      atmosphericPressure: '',
      
      // Test Ekipmanları
      balancingMachine: '',
      vibrationSensor: '',
      calibrationDate: '',
      softwareVersion: '',
      
      // İş Emri ve Kalite
      customerRequirements: '',
      testProcedure: 'standard',
      documentationLevel: 'full',
      qualityInspector: '',
      approvalStatus: 'pending',
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Dosya yüklendi:', file.name);
      // TODO: Implement file upload logic
    }
  };

  return (
    <Container maxWidth={false}>
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Yeni test başarıyla oluşturuldu! Test No: {generateTestNumber()}
        </Alert>
      )}
      
      <Card>
        <CardHeader 
          title="Yeni Test Formu" 
          subheader="Fan balans ve kaynak kalite kontrolü için yeni test oluşturun"
        />
        <CardContent>
          {/* Temel Bilgiler */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EngineeringIcon />
            Temel Bilgiler
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <FormControl fullWidth error={!!errors.productType}>
              <InputLabel>Ürün Tipi *</InputLabel>
              <Select 
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                label="Ürün Tipi *"
              >
                {PRODUCT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: type.color 
                        }} 
                      />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.productType && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.productType}
                </Typography>
              )}
            </FormControl>
            
            <TextField 
              fullWidth 
              label="Seri Numarası *" 
              placeholder="UY-2024-001"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              error={!!errors.serialNumber}
              helperText={errors.serialNumber}
            />
            
            <TextField 
              fullWidth 
              label="Müşteri *" 
              placeholder="ABC Sanayi A.Ş."
              value={formData.customer}
              onChange={(e) => handleInputChange('customer', e.target.value)}
              error={!!errors.customer}
              helperText={errors.customer}
            />
            
            <TextField 
              fullWidth 
              label="İş Emri Numarası" 
              placeholder="WO-2024-001"
              value={formData.workOrder || ''}
              onChange={(e) => handleInputChange('workOrder', e.target.value)}
            />
            
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select 
                value={formData.priority || 'normal'}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Öncelik"
              >
                <MenuItem value="low">Düşük</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
                <MenuItem value="urgent">Acil</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Fan Teknik Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AirIcon />
            Fan Teknik Bilgileri
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="Fan Model/Tip *" 
              placeholder="FAN-450-HTR"
              value={formData.fanModel}
              onChange={(e) => handleInputChange('fanModel', e.target.value)}
              error={!!errors.fanModel}
              helperText={errors.fanModel}
            />
            
            <TextField 
              fullWidth 
              label="Çap (mm) *" 
              placeholder="450"
              type="number"
              value={formData.diameter}
              onChange={(e) => handleInputChange('diameter', e.target.value)}
              error={!!errors.diameter}
              helperText={errors.diameter}
            />
            
            <TextField 
              fullWidth 
              label="Nominal Devir (RPM) *" 
              placeholder="1450"
              type="number"
              value={formData.rpmNominal}
              onChange={(e) => handleInputChange('rpmNominal', e.target.value)}
              error={!!errors.rpmNominal}
              helperText={errors.rpmNominal}
            />
            
            <TextField 
              fullWidth 
              label="Test Devri (RPM)" 
              placeholder="1450"
              type="number"
              value={formData.rpmTest}
              onChange={(e) => handleInputChange('rpmTest', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Kanat Sayısı *" 
              placeholder="8"
              type="number"
              value={formData.bladeCount}
              onChange={(e) => handleInputChange('bladeCount', e.target.value)}
              error={!!errors.bladeCount}
              helperText={errors.bladeCount}
            />
            
            <TextField 
              fullWidth 
              label="Motor Gücü (kW)" 
              placeholder="15"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.motorPower}
              onChange={(e) => handleInputChange('motorPower', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Hava Debisi (m³/h)" 
              placeholder="5000"
              type="number"
              value={formData.airFlow}
              onChange={(e) => handleInputChange('airFlow', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Basınç (Pa)" 
              placeholder="500"
              type="number"
              value={formData.pressure}
              onChange={(e) => handleInputChange('pressure', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Rotor Ağırlığı (kg) *" 
              placeholder="25.5"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              error={!!errors.weight}
              helperText={errors.weight}
            />
            
            <FormControl fullWidth>
              <InputLabel>Rotor Tipi</InputLabel>
              <Select 
                value={formData.rotorType || 'rigid'}
                onChange={(e) => handleInputChange('rotorType', e.target.value)}
                label="Rotor Tipi"
              >
                <MenuItem value="rigid">Rijit Rotor</MenuItem>
                <MenuItem value="flexible">Esnek Rotor</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Rotor ve Bearing Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EngineeringIcon />
            Rotor ve Yatak Bilgileri
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="Yatak Tipi" 
              placeholder="SKF 6309"
              value={formData.bearingType || ''}
              onChange={(e) => handleInputChange('bearingType', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Yatak Açıklığı (mm)" 
              placeholder="300"
              type="number"
              value={formData.bearingSpan || ''}
              onChange={(e) => handleInputChange('bearingSpan', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Overhang (mm)" 
              placeholder="50"
              type="number"
              value={formData.overhang || ''}
              onChange={(e) => handleInputChange('overhang', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Kritik Hız (RPM)" 
              placeholder="2100"
              type="number"
              value={formData.criticalSpeed || ''}
              onChange={(e) => handleInputChange('criticalSpeed', e.target.value)}
            />
            
            <Tooltip title="Nominal devir değerinden otomatik alınır">
              <TextField 
                fullWidth 
                label="Çalışma Hızı (RPM)" 
                placeholder="Nominal devirden otomatik"
                type="number"
                value={formData.operatingSpeed || ''}
                onChange={(e) => handleInputChange('operatingSpeed', e.target.value)}
                helperText="Nominal devir girdiğinizde otomatik ayarlanır"
                InputProps={{
                  style: { backgroundColor: formData.operatingSpeed ? '#f0f8ff' : 'transparent' }
                }}
              />
            </Tooltip>
          </Box>

          {/* İlk Titreşim Ölçümleri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon />
            İlk Titreşim Ölçümleri (Test Öncesi)
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="A Düzlemi Titreşim (μm)" 
              placeholder="25.0"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.initialVibrationA || ''}
              onChange={(e) => handleInputChange('initialVibrationA', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="B Düzlemi Titreşim (μm)" 
              placeholder="20.0"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.initialVibrationB || ''}
              onChange={(e) => handleInputChange('initialVibrationB', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="A Düzlemi Faz (°)" 
              placeholder="45"
              type="number"
              value={formData.initialPhaseA || ''}
              onChange={(e) => handleInputChange('initialPhaseA', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="B Düzlemi Faz (°)" 
              placeholder="120"
              type="number"
              value={formData.initialPhaseB || ''}
              onChange={(e) => handleInputChange('initialPhaseB', e.target.value)}
            />
            
            <FormControl fullWidth>
              <InputLabel>Baseline Kabul Edilebilir mi?</InputLabel>
              <Select 
                value={formData.baselineAcceptable || 'yes'}
                onChange={(e) => handleInputChange('baselineAcceptable', e.target.value)}
                label="Baseline Kabul Edilebilir mi?"
              >
                <MenuItem value="yes">Evet</MenuItem>
                <MenuItem value="no">Hayır</MenuItem>
                <MenuItem value="marginal">Sınırda</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Balans Test Parametreleri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BalanceIcon />
            Balans Test Parametreleri
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <FormControl fullWidth>
              <InputLabel>Balans Sınıfı</InputLabel>
              <Select 
                value={formData.balanceClass}
                onChange={(e) => handleInputChange('balanceClass', e.target.value)}
                label="Balans Sınıfı"
              >
                <MenuItem value="G2.5">G2.5 (Yüksek Hassasiyet)</MenuItem>
                <MenuItem value="G6.3">G6.3 (Standart Fan)</MenuItem>
                <MenuItem value="G16">G16 (Endüstriyel Fan)</MenuItem>
                <MenuItem value="G40">G40 (Ağır Endüstriyel)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Test Standardı</InputLabel>
              <Select 
                value={formData.testStandard}
                onChange={(e) => handleInputChange('testStandard', e.target.value)}
                label="Test Standardı"
              >
                <MenuItem value="ISO_1940">ISO 1940</MenuItem>
                <MenuItem value="DIN_ISO_1940">DIN ISO 1940</MenuItem>
                <MenuItem value="ANSI_S2_19">ANSI S2.19</MenuItem>
                <MenuItem value="VDI_2060">VDI 2060</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Balans sınıfı, ağırlık ve çapa göre otomatik hesaplanır">
              <TextField 
                fullWidth 
                label="İzin Verilen Dengesizlik (g·mm) *" 
                placeholder="Otomatik hesaplanacak"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.allowableUnbalance}
                onChange={(e) => handleInputChange('allowableUnbalance', e.target.value)}
                error={!!errors.allowableUnbalance}
                helperText={errors.allowableUnbalance || "Balans sınıfı seçtiğinizde otomatik hesaplanır"}
                InputProps={{
                  style: { backgroundColor: formData.allowableUnbalance ? '#f0f8ff' : 'transparent' }
                }}
              />
            </Tooltip>
            
            <Tooltip title="Nominal devir değerinden otomatik alınır">
              <TextField 
                fullWidth 
                label="Test Hızı (RPM) *" 
                placeholder="Nominal devirden otomatik"
                type="number"
                value={formData.testSpeed}
                onChange={(e) => handleInputChange('testSpeed', e.target.value)}
                error={!!errors.testSpeed}
                helperText={errors.testSpeed || "Nominal devir girdiğinizde otomatik ayarlanır"}
                InputProps={{
                  style: { backgroundColor: formData.testSpeed ? '#f0f8ff' : 'transparent' }
                }}
              />
            </Tooltip>
            
            <FormControl fullWidth>
              <InputLabel>Ölçüm Düzlemi Sayısı</InputLabel>
              <Select 
                value={formData.measuringPlanes}
                onChange={(e) => handleInputChange('measuringPlanes', e.target.value)}
                label="Ölçüm Düzlemi Sayısı"
              >
                <MenuItem value="1">Tek Düzlem</MenuItem>
                <MenuItem value="2">Çift Düzlem</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Balans Ağırlık Bilgileri - 1. Düzlem */}
          <Typography variant="h6" sx={{ mb: 2, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrecisionManufacturingIcon />
            Balans Ağırlığı - 1. Düzlem (A)
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="Trial Ağırlık (gram)" 
              placeholder="10.5"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.plane1TrialWeight || ''}
              onChange={(e) => handleInputChange('plane1TrialWeight', e.target.value)}
              error={!!errors.plane1TrialWeight}
              helperText={errors.plane1TrialWeight}
            />
            
            <TextField 
              fullWidth 
              label="Trial Açı (°)" 
              placeholder="90"
              type="number"
              inputProps={{ step: "1", min: "0", max: "360" }}
              value={formData.plane1TrialAngle || ''}
              onChange={(e) => handleInputChange('plane1TrialAngle', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Trial Yarıçap (mm)" 
              placeholder="150"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.plane1TrialRadius || ''}
              onChange={(e) => handleInputChange('plane1TrialRadius', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Düzeltme Ağırlığı (gram)" 
              placeholder="8.2"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.plane1CorrectionWeight || ''}
              onChange={(e) => handleInputChange('plane1CorrectionWeight', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Düzeltme Açısı (°)" 
              placeholder="75"
              type="number"
              inputProps={{ step: "1", min: "0", max: "360" }}
              value={formData.plane1CorrectionAngle || ''}
              onChange={(e) => handleInputChange('plane1CorrectionAngle', e.target.value)}
            />
            
            <Tooltip title="Trial yarıçapından otomatik kopyalanır">
              <TextField 
                fullWidth 
                label="Düzeltme Yarıçapı (mm)" 
                placeholder="Trial yarıçapından otomatik"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.plane1CorrectionRadius || ''}
                onChange={(e) => handleInputChange('plane1CorrectionRadius', e.target.value)}
                helperText="Trial yarıçap girdiğinizde otomatik kopyalanır"
                InputProps={{
                  style: { backgroundColor: formData.plane1CorrectionRadius ? '#f0f8ff' : 'transparent' }
                }}
              />
            </Tooltip>
          </Box>

          {/* Balans Ağırlık Bilgileri - 2. Düzlem */}
          {formData.measuringPlanes === '2' && (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PrecisionManufacturingIcon />
                Balans Ağırlığı - 2. Düzlem (B)
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                mb: 4,
                '& > *': { 
                  flex: '1 1 300px',
                  minWidth: '300px'
                }
              }}>
                <TextField 
                  fullWidth 
                  label="Trial Ağırlık (gram)" 
                  placeholder="12.0"
                  type="number"
                  inputProps={{ step: "0.1" }}
                  value={formData.plane2TrialWeight || ''}
                  onChange={(e) => handleInputChange('plane2TrialWeight', e.target.value)}
                />
                
                <TextField 
                  fullWidth 
                  label="Trial Açı (°)" 
                  placeholder="270"
                  type="number"
                  inputProps={{ step: "1", min: "0", max: "360" }}
                  value={formData.plane2TrialAngle || ''}
                  onChange={(e) => handleInputChange('plane2TrialAngle', e.target.value)}
                />
                
                <TextField 
                  fullWidth 
                  label="Trial Yarıçap (mm)" 
                  placeholder="150"
                  type="number"
                  inputProps={{ step: "0.1" }}
                  value={formData.plane2TrialRadius || ''}
                  onChange={(e) => handleInputChange('plane2TrialRadius', e.target.value)}
                />
                
                <TextField 
                  fullWidth 
                  label="Düzeltme Ağırlığı (gram)" 
                  placeholder="9.8"
                  type="number"
                  inputProps={{ step: "0.1" }}
                  value={formData.plane2CorrectionWeight || ''}
                  onChange={(e) => handleInputChange('plane2CorrectionWeight', e.target.value)}
                />
                
                <TextField 
                  fullWidth 
                  label="Düzeltme Açısı (°)" 
                  placeholder="245"
                  type="number"
                  inputProps={{ step: "1", min: "0", max: "360" }}
                  value={formData.plane2CorrectionAngle || ''}
                  onChange={(e) => handleInputChange('plane2CorrectionAngle', e.target.value)}
                />
                
                <Tooltip title="Trial yarıçapından otomatik kopyalanır">
                  <TextField 
                    fullWidth 
                    label="Düzeltme Yarıçapı (mm)" 
                    placeholder="Trial yarıçapından otomatik"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={formData.plane2CorrectionRadius || ''}
                    onChange={(e) => handleInputChange('plane2CorrectionRadius', e.target.value)}
                    helperText="Trial yarıçap girdiğinizde otomatik kopyalanır"
                    InputProps={{
                      style: { backgroundColor: formData.plane2CorrectionRadius ? '#f0f8ff' : 'transparent' }
                    }}
                  />
                </Tooltip>
              </Box>
            </>
          )}

          {/* Final Titreşim Ölçümleri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            Final Titreşim Ölçümleri (Test Sonrası)
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="A Düzlemi Final Titreşim (μm)" 
              placeholder="3.2"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.finalVibrationA || ''}
              onChange={(e) => handleInputChange('finalVibrationA', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="B Düzlemi Final Titreşim (μm)" 
              placeholder="2.8"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.finalVibrationB || ''}
              onChange={(e) => handleInputChange('finalVibrationB', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="A Düzlemi Final Faz (°)" 
              placeholder="85"
              type="number"
              value={formData.finalPhaseA || ''}
              onChange={(e) => handleInputChange('finalPhaseA', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="B Düzlemi Final Faz (°)" 
              placeholder="195"
              type="number"
              value={formData.finalPhaseB || ''}
              onChange={(e) => handleInputChange('finalPhaseB', e.target.value)}
            />
            
            <Tooltip title="İlk ve final titreşim değerlerinden otomatik hesaplanır">
              <TextField 
                fullWidth 
                label="A Düzlemi İyileştirme Oranı (%)" 
                placeholder="Otomatik hesaplanacak"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.improvementRatioA || ''}
                onChange={(e) => handleInputChange('improvementRatioA', e.target.value)}
                helperText="İlk ve final titreşim girdiğinizde otomatik hesaplanır"
                InputProps={{
                  style: { backgroundColor: formData.improvementRatioA ? '#e8f5e8' : 'transparent' }
                }}
              />
            </Tooltip>
            
            <Tooltip title="İlk ve final titreşim değerlerinden otomatik hesaplanır">
              <TextField 
                fullWidth 
                label="B Düzlemi İyileştirme Oranı (%)" 
                placeholder="Otomatik hesaplanacak"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.improvementRatioB || ''}
                onChange={(e) => handleInputChange('improvementRatioB', e.target.value)}
                helperText="İlk ve final titreşim girdiğinizde otomatik hesaplanır"
                InputProps={{
                  style: { backgroundColor: formData.improvementRatioB ? '#e8f5e8' : 'transparent' }
                }}
              />
            </Tooltip>
          </Box>

          {/* Tolerans ve Kabul Kriterleri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PolicyIcon />
            Tolerans ve Kabul Kriterleri
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <Tooltip title="Kabul kriterlerine göre otomatik belirlenir">
              <TextField 
                fullWidth 
                label="Hedef Titreşim (μm)" 
                placeholder="Kabul kriterinden otomatik"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.targetVibration || ''}
                onChange={(e) => handleInputChange('targetVibration', e.target.value)}
                helperText="Kabul kriterleri seçtiğinizde otomatik ayarlanır"
                InputProps={{
                  style: { backgroundColor: formData.targetVibration ? '#f0f8ff' : 'transparent' }
                }}
              />
            </Tooltip>
            
            <TextField 
              fullWidth 
              label="Elde Edilen Titreşim (μm)" 
              placeholder="3.0"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.achievedVibration || ''}
              onChange={(e) => handleInputChange('achievedVibration', e.target.value)}
              helperText={
                formData.achievedVibration && formData.targetVibration 
                  ? `Hedeften ${(parseFloat(formData.achievedVibration) <= parseFloat(formData.targetVibration)) ? 'BAŞARILI' : 'YÜKSEK'}`
                  : undefined
              }
              InputProps={{
                style: { 
                  backgroundColor: formData.achievedVibration && formData.targetVibration
                    ? (parseFloat(formData.achievedVibration) <= parseFloat(formData.targetVibration) ? '#e8f5e8' : '#fff2f2')
                    : 'transparent'
                }
              }}
            />
            
            <Tooltip title="Düzeltme ağırlıklarından otomatik hesaplanır">
              <TextField 
                fullWidth 
                label="Residual Unbalance (gmm)" 
                placeholder="Otomatik hesaplanacak"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.residualUnbalance || ''}
                onChange={(e) => handleInputChange('residualUnbalance', e.target.value)}
                helperText="Düzeltme ağırlıkları girdiğinizde otomatik hesaplanır"
                InputProps={{
                  style: { backgroundColor: formData.residualUnbalance ? '#f0f8ff' : 'transparent' }
                }}
              />
            </Tooltip>
            
            <Tooltip title="Hedef ve elde edilen titreşim karşılaştırılarak otomatik belirlenir">
              <FormControl fullWidth>
                <InputLabel>Tolerans Kontrolü</InputLabel>
                <Select 
                  value={formData.toleranceCheck || ''}
                  onChange={(e) => handleInputChange('toleranceCheck', e.target.value)}
                  label="Tolerans Kontrolü"
                  style={{ backgroundColor: formData.toleranceCheck ? '#fff3cd' : 'transparent' }}
                >
                  <MenuItem value="passed">BAŞARILI ✓</MenuItem>
                  <MenuItem value="failed">BAŞARISIZ ✗</MenuItem>
                  <MenuItem value="marginal">SINIRDA ⚠</MenuItem>
                </Select>
                {formData.toleranceCheck && (
                  <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Hedef ve elde edilen titreşim karşılaştırılarak otomatik belirlendi
                  </Typography>
                )}
              </FormControl>
            </Tooltip>
            
            <FormControl fullWidth>
              <InputLabel>Kabul Kriterleri</InputLabel>
              <Select 
                value={formData.acceptanceCriteria || 'ISO_1940_G6.3'}
                onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
                label="Kabul Kriterleri"
              >
                <MenuItem value="ISO_1940_G2.5">ISO 1940 G2.5</MenuItem>
                <MenuItem value="ISO_1940_G6.3">ISO 1940 G6.3</MenuItem>
                <MenuItem value="ISO_1940_G16">ISO 1940 G16</MenuItem>
                <MenuItem value="ISO_1940_G40">ISO 1940 G40</MenuItem>
                <MenuItem value="custom">Özel Kriter</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Çevresel Koşullar */}
          <Typography variant="h6" sx={{ mb: 2, color: 'info.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThermostatIcon />
            Çevresel Koşullar
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="Sıcaklık (°C)" 
              placeholder="20"
              type="number"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Nem (%)" 
              placeholder="50"
              type="number"
              value={formData.humidity}
              onChange={(e) => handleInputChange('humidity', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Atmosferik Basınç (hPa)" 
              placeholder="1013"
              type="number"
              value={formData.atmosphericPressure}
              onChange={(e) => handleInputChange('atmosphericPressure', e.target.value)}
            />
          </Box>

          {/* Test Ekipmanları */}
          <Typography variant="h6" sx={{ mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            Test Ekipmanları
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="Balans Makinesi" 
              placeholder="Schenck HM20"
              value={formData.balancingMachine}
              onChange={(e) => handleInputChange('balancingMachine', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Titreşim Sensörü" 
              placeholder="Accelerometer PCB 352C33"
              value={formData.vibrationSensor}
              onChange={(e) => handleInputChange('vibrationSensor', e.target.value)}
            />
            
            <TextField 
              fullWidth 
              label="Son Kalibrasyon Tarihi" 
              type="date"
              value={formData.calibrationDate}
              onChange={(e) => handleInputChange('calibrationDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField 
              fullWidth 
              label="Yazılım Versiyonu" 
              placeholder="BalanceView v3.2.1"
              value={formData.softwareVersion || ''}
              onChange={(e) => handleInputChange('softwareVersion', e.target.value)}
            />
          </Box>

          {/* Test Bilgileri ve Operatör */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon />
            Test Yönetimi
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 4,
            '& > *': { 
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            <TextField 
              fullWidth 
              label="Operatör *" 
              placeholder="Mehmet Yılmaz"
              value={formData.operator}
              onChange={(e) => handleInputChange('operator', e.target.value)}
              error={!!errors.operator}
              helperText={errors.operator}
            />
            
            <TextField 
              fullWidth 
              label="Test Tarihi" 
              type="date"
              value={formData.testDate}
              onChange={(e) => handleInputChange('testDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Test Prosedürü</InputLabel>
              <Select 
                value={formData.testProcedure}
                onChange={(e) => handleInputChange('testProcedure', e.target.value)}
                label="Test Prosedürü"
              >
                <MenuItem value="standard">Standart Prosedür</MenuItem>
                <MenuItem value="accelerated">Hızlandırılmış Test</MenuItem>
                <MenuItem value="extended">Genişletilmiş Test</MenuItem>
                <MenuItem value="custom">Özel Prosedür</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Dökümentasyon Seviyesi</InputLabel>
              <Select 
                value={formData.documentationLevel}
                onChange={(e) => handleInputChange('documentationLevel', e.target.value)}
                label="Dökümentasyon Seviyesi"
              >
                <MenuItem value="basic">Temel Rapor</MenuItem>
                <MenuItem value="full">Tam Rapor</MenuItem>
                <MenuItem value="detailed">Detaylı Analiz</MenuItem>
                <MenuItem value="certification">Sertifikasyon Raporu</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              fullWidth 
              label="Kalite Müfettişi" 
              placeholder="İsmail Kaya"
              value={formData.qualityInspector || ''}
              onChange={(e) => handleInputChange('qualityInspector', e.target.value)}
            />
            
            <FormControl fullWidth>
              <InputLabel>Onay Durumu</InputLabel>
              <Select 
                value={formData.approvalStatus || 'pending'}
                onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                label="Onay Durumu"
              >
                <MenuItem value="pending">Onay Bekliyor</MenuItem>
                <MenuItem value="approved">Onaylandı ✓</MenuItem>
                <MenuItem value="rejected">Reddedildi ✗</MenuItem>
                <MenuItem value="revision">Revizyon Gerekli</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Özel Gereksinimler */}
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Özel Gereksinimler
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <TextField 
              fullWidth 
              label="Müşteri Gereksinimleri ve Notlar" 
              placeholder="Özel test koşulları, ek gereksinimler, dikkat edilecek hususlar..."
              multiline
              rows={4}
              value={formData.customerRequirements}
              onChange={(e) => handleInputChange('customerRequirements', e.target.value)}
            />
          </Box>

          {/* Form Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateTest}
                size="large"
              >
                Test Oluştur
              </Button>
              
              <Button 
                variant="outlined" 
                component="label"
                startIcon={<UploadIcon />}
                size="large"
              >
                Dosya Yükle
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              * Zorunlu alanlar
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

// Main Component
const FanTestAnalysis: React.FC = () => {
  // ✅ DÖF pattern uygulandı: State initialization with localStorage
  const [testRecords, setTestRecords] = useState<TestRecord[]>(() => {
    try {
      const storedRecords = localStorage.getItem('fanTestRecords');
      if (storedRecords) {
        const parsed = JSON.parse(storedRecords);
        return Array.isArray(parsed) ? parsed : mockTestRecords;
      }
      // Eğer localStorage'da veri yoksa, mock veri kullan ve kaydet
      localStorage.setItem('fanTestRecords', JSON.stringify(mockTestRecords));
      return mockTestRecords;
    } catch (error) {
      console.error('❌ localStorage\'dan fan test verileri okunamadı:', error);
      return mockTestRecords;
    }
  });
  
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // ✅ DÖF pattern uygulandı: Auto-save to localStorage when testRecords change
  useEffect(() => {
    try {
      localStorage.setItem('fanTestRecords', JSON.stringify(testRecords));
      console.log(`📊 Fan test verileri localStorage'a kaydedildi: ${testRecords.length} kayıt`);
    } catch (error) {
      console.error('❌ localStorage\'a fan test verileri kaydedilemedi:', error);
    }
  }, [testRecords]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const contextValue: TestContextType = {
    testRecords,
    setTestRecords,
    selectedTest,
    setSelectedTest,
  };

  return (
    <TestContext.Provider value={contextValue}>
      <Box sx={{ p: 3 }}>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: 64,
              },
            }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Dashboard" 
              iconPosition="start"
            />
            <Tab 
              icon={<ListIcon />} 
              label="Test Kayıtları" 
              iconPosition="start"
            />
            <Tab 
              icon={<AddIcon />} 
              label="Yeni Test" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Raporlar" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <TestDashboard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TestManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TestCreation />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ReportsModule />
        </TabPanel>
      </Box>
    </TestContext.Provider>
  );
};

export default FanTestAnalysis; 