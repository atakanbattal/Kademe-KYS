import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Straighten as StraightenIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
  ExpandMore as ExpandMoreIcon,
  Engineering as EngineeringIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Types and Interfaces
interface ControlPlan {
  id: string;
  planNumber: string;
  partNumber: string;
  partName: string;
  drawingNumber: string;
  revision: string;
  customerName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';
  controlPoints: ControlPoint[];
}

interface ControlPoint {
  id: string;
  sequence: number;
  characteristic: string;
  specification: string;
  tolerance: {
    upperLimit: number;
    lowerLimit: number;
    nominalValue: number;
    toleranceType: 'BILATERAL' | 'UNILATERAL_PLUS' | 'UNILATERAL_MINUS';
  };
  measurementMethod: string;
  equipment: string;
  frequency: string;
  sampleSize: number;
  criticalityLevel: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'FUNCTIONAL' | 'SAFETY';
  measurements: Measurement[];
}

interface Measurement {
  id: string;
  value: number;
  measuredBy: string;
  measuredAt: string;
  equipment: string;
  status: 'PASS' | 'FAIL' | 'OUT_OF_SPEC';
  deviation: number;
  notes?: string;
}

interface DimensionalReport {
  id: string;
  reportNumber: string;
  controlPlanId: string;
  partNumber: string;
  batchNumber: string;
  quantity: number;
  inspector: string;
  inspectionDate: string;
  overallResult: 'PASS' | 'FAIL' | 'CONDITIONAL';
  measurements: Measurement[];
  conclusion: string;
}

// Styled Components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:before': {
    display: 'none',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor: 
    status === 'PASS' ? theme.palette.success.main :
    status === 'FAIL' ? theme.palette.error.main :
    status === 'CONDITIONAL' ? theme.palette.warning.main :
    theme.palette.grey[400],
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const DimensionalControl: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('panel1');
  const [controlPlans, setControlPlans] = useState<ControlPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ControlPlan | null>(null);
  const [measurements, setMeasurements] = useState<{ [key: string]: string }>({});
  const [inspectionData, setInspectionData] = useState({
    partNumber: '',
    batchNumber: '',
    quantity: 0,
    inspector: '',
    inspectionDate: new Date().toISOString().split('T')[0],
  });

  // Control Plan Management
  const [planDialog, setPlanDialog] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<ControlPlan>>({
    planNumber: '',
    partNumber: '',
    partName: '',
    drawingNumber: '',
    revision: '',
    customerName: '',
    status: 'ACTIVE',
    controlPoints: [],
  });

  // Control Point Management
  const [pointDialog, setPointDialog] = useState(false);
  const [newControlPoint, setNewControlPoint] = useState<Partial<ControlPoint>>({
    sequence: 1,
    characteristic: '',
    specification: '',
    tolerance: {
      upperLimit: 0,
      lowerLimit: 0,
      nominalValue: 0,
      toleranceType: 'BILATERAL',
    },
    measurementMethod: '',
    equipment: '',
    frequency: '2 üründen 1 adet', // MAJOR için varsayılan frekans
    sampleSize: 1,
    criticalityLevel: 'MAJOR',
    measurements: [],
  });

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleCreateControlPlan = () => {
    const plan: ControlPlan = {
      id: Date.now().toString(),
      planNumber: newPlan.planNumber || '',
      partNumber: newPlan.partNumber || '',
      partName: newPlan.partName || '',
      drawingNumber: newPlan.drawingNumber || '',
      revision: newPlan.revision || '',
      customerName: newPlan.customerName || '',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: newPlan.status as 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW',
      controlPoints: [],
    };

    setControlPlans([...controlPlans, plan]);
    setPlanDialog(false);
    setNewPlan({});
  };

  const handleAddControlPoint = () => {
    if (!selectedPlan) return;

    const controlPoint: ControlPoint = {
      id: Date.now().toString(),
      sequence: newControlPoint.sequence || 1,
      characteristic: newControlPoint.characteristic || '',
      specification: newControlPoint.specification || '',
      tolerance: newControlPoint.tolerance!,
      measurementMethod: newControlPoint.measurementMethod || '',
      equipment: newControlPoint.equipment || '',
      frequency: newControlPoint.frequency || '',
      sampleSize: newControlPoint.sampleSize || 1,
      criticalityLevel: newControlPoint.criticalityLevel as 'CRITICAL' | 'MAJOR' | 'MINOR' | 'FUNCTIONAL' | 'SAFETY',
      measurements: [],
    };

    const updatedPlan = {
      ...selectedPlan,
      controlPoints: [...selectedPlan.controlPoints, controlPoint].sort((a, b) => a.sequence - b.sequence),
    };

    setControlPlans(controlPlans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
    setSelectedPlan(updatedPlan);
    setPointDialog(false);
    setNewControlPoint({});
  };

  const calculateStatus = (value: number, tolerance: ControlPoint['tolerance']): 'PASS' | 'FAIL' | 'OUT_OF_SPEC' => {
    const { upperLimit, lowerLimit } = tolerance;
    if (value >= lowerLimit && value <= upperLimit) {
      return 'PASS';
    } else {
      return 'FAIL';
    }
  };

  const handleSaveMeasurements = () => {
    if (!selectedPlan) return;

    const updatedControlPoints = selectedPlan.controlPoints.map(cp => {
      const measurementValue = parseFloat(measurements[cp.id] || '0');
      if (measurementValue === 0) return cp;

      const measurement: Measurement = {
        id: Date.now().toString() + cp.id,
        value: measurementValue,
        measuredBy: inspectionData.inspector,
        measuredAt: new Date().toISOString(),
        equipment: cp.equipment,
        status: calculateStatus(measurementValue, cp.tolerance),
        deviation: measurementValue - cp.tolerance.nominalValue,
      };

      return {
        ...cp,
        measurements: [...cp.measurements, measurement],
      };
    });

    const updatedPlan = {
      ...selectedPlan,
      controlPoints: updatedControlPoints,
    };

    setControlPlans(controlPlans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
    setSelectedPlan(updatedPlan);
    setMeasurements({});
    alert('Ölçüm sonuçları başarıyla kaydedildi!');
  };

  const getOverallResult = (controlPoints: ControlPoint[]): 'PASS' | 'FAIL' | 'CONDITIONAL' => {
    const latestMeasurements = controlPoints.map(cp => cp.measurements[cp.measurements.length - 1]).filter(Boolean);
    
    if (latestMeasurements.length === 0) return 'CONDITIONAL';
    
    const criticalFails = latestMeasurements.filter(m => m.status === 'FAIL' && 
      controlPoints.find(cp => cp.measurements.includes(m))?.criticalityLevel === 'CRITICAL').length;
    
    const majorFails = latestMeasurements.filter(m => m.status === 'FAIL' && 
      controlPoints.find(cp => cp.measurements.includes(m))?.criticalityLevel === 'MAJOR').length;

    if (criticalFails > 0) return 'FAIL';
    if (majorFails > 2) return 'FAIL';
    if (majorFails > 0) return 'CONDITIONAL';
    
    return 'PASS';
  };

  // Kritiklik seviyesine göre otomatik frekans belirleme
  const getFrequencyByCriticality = (criticalityLevel: string): string => {
    switch (criticalityLevel) {
      case 'MINOR':
        return 'Her partiden 1 adet';
      case 'FUNCTIONAL':
        return '5 üründen 1 adet';
      case 'CRITICAL':
        return '3 üründen 1 adet';
      case 'SAFETY':
        return 'Her üründen 1 adet';
      case 'MAJOR':
        return '2 üründen 1 adet'; // Varsayılan MAJOR için
      default:
        return '';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Statistics */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 3 
      }}>
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
          minWidth: '200px'
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {controlPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif Kontrol Planı
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
          minWidth: '200px'
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {controlPlans.reduce((sum, p) => sum + p.controlPoints.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Kontrol Noktası
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
          minWidth: '200px'
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {controlPlans.reduce((sum, p) => sum + p.controlPoints.reduce((s, cp) => s + cp.measurements.length, 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Ölçüm
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
          minWidth: '200px'
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {controlPlans.filter(p => getOverallResult(p.controlPoints) === 'PASS').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Başarılı Plan
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Control Plan Management */}
      <StyledAccordion
        expanded={expanded === 'panel1'}
        onChange={handleAccordionChange('panel1')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Kontrol Planı Yönetimi</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Mevcut Kontrol Planları</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPlanDialog(true)}
            >
              Yeni Kontrol Planı
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan No</TableCell>
                  <TableCell>Parça No</TableCell>
                  <TableCell>Parça Adı</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Kontrol Noktası</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {controlPlans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>{plan.planNumber}</TableCell>
                    <TableCell>{plan.partNumber}</TableCell>
                    <TableCell>{plan.partName}</TableCell>
                    <TableCell>{plan.customerName}</TableCell>
                    <TableCell>
                      <StatusChip 
                        label={plan.status} 
                        status={plan.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{plan.controlPoints.length}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Planı Seç">
                        <IconButton 
                          color="primary"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton color="info">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </StyledAccordion>

      {/* Selected Plan Details */}
      {selectedPlan && (
        <StyledAccordion
          expanded={expanded === 'panel2'}
          onChange={handleAccordionChange('panel2')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Kontrol Planı Detayları: {selectedPlan.partNumber} - {selectedPlan.partName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Kontrol Noktaları</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPointDialog(true)}
              >
                Kontrol Noktası Ekle
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sıra</TableCell>
                    <TableCell>Karakteristik</TableCell>
                    <TableCell>Spesifikasyon</TableCell>
                    <TableCell>Nominal</TableCell>
                    <TableCell>Alt Limit</TableCell>
                    <TableCell>Üst Limit</TableCell>
                    <TableCell>Kritiklik</TableCell>
                    <TableCell>Ölçüm Gereksinimi</TableCell>
                    <TableCell>Son Ölçüm</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPlan.controlPoints.map((cp) => {
                    const lastMeasurement = cp.measurements[cp.measurements.length - 1];
                    return (
                      <TableRow key={cp.id}>
                        <TableCell>{cp.sequence}</TableCell>
                        <TableCell>{cp.characteristic}</TableCell>
                        <TableCell>{cp.specification}</TableCell>
                        <TableCell>{cp.tolerance.nominalValue}</TableCell>
                        <TableCell>{cp.tolerance.lowerLimit}</TableCell>
                        <TableCell>{cp.tolerance.upperLimit}</TableCell>
                        <TableCell>
                          <Chip 
                            label={cp.criticalityLevel}
                            size="small"
                            color={
                              cp.criticalityLevel === 'CRITICAL' ? 'error' :
                              cp.criticalityLevel === 'MAJOR' ? 'warning' :
                              cp.criticalityLevel === 'FUNCTIONAL' ? 'info' :
                              cp.criticalityLevel === 'SAFETY' ? 'success' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={cp.frequency}
                            size="small"
                            variant="filled"
                            color="info"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              minWidth: '120px',
                              '& .MuiChip-label': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {lastMeasurement ? lastMeasurement.value : '-'}
                        </TableCell>
                        <TableCell>
                          {lastMeasurement && (
                            <StatusChip 
                              label={lastMeasurement.status}
                              status={lastMeasurement.status}
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </StyledAccordion>
      )}

      {/* Measurement Entry */}
      {selectedPlan && selectedPlan.controlPoints.length > 0 && (
        <StyledAccordion
          expanded={expanded === 'panel3'}
          onChange={handleAccordionChange('panel3')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Ölçüm Girişi</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Inspection Data */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Muayene Bilgileri</Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2 
              }}>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                  minWidth: '200px'
                }}>
                  <TextField
                    fullWidth
                    label="Parti Numarası"
                    value={inspectionData.batchNumber}
                    onChange={(e) => setInspectionData({...inspectionData, batchNumber: e.target.value})}
                  />
                </Box>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                  minWidth: '200px'
                }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Miktar"
                    value={inspectionData.quantity}
                    onChange={(e) => setInspectionData({...inspectionData, quantity: parseInt(e.target.value)})}
                  />
                </Box>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                  minWidth: '200px'
                }}>
                  <TextField
                    fullWidth
                    label="Muayene Eden"
                    value={inspectionData.inspector}
                    onChange={(e) => setInspectionData({...inspectionData, inspector: e.target.value})}
                  />
                </Box>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                  minWidth: '200px'
                }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Muayene Tarihi"
                    value={inspectionData.inspectionDate}
                    onChange={(e) => setInspectionData({...inspectionData, inspectionDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Measurement Inputs */}
            <Typography variant="h6" gutterBottom>Ölçüm Değerleri</Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2 
            }}>
              {selectedPlan.controlPoints.map((cp) => (
                <Box key={cp.id} sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' },
                  minWidth: '250px'
                }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`${cp.sequence}. ${cp.characteristic}`}
                    value={measurements[cp.id] || ''}
                    onChange={(e) => setMeasurements({...measurements, [cp.id]: e.target.value})}
                    helperText={`${cp.frequency} | Nominal: ${cp.tolerance.nominalValue} (${cp.tolerance.lowerLimit} - ${cp.tolerance.upperLimit})`}
                    inputProps={{ step: 0.01 }}
                  />
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveMeasurements}
                disabled={!inspectionData.inspector || Object.keys(measurements).length === 0}
              >
                Ölçümleri Kaydet
              </Button>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                disabled={selectedPlan.controlPoints.every(cp => cp.measurements.length === 0)}
              >
                Rapor Oluştur
              </Button>
            </Box>
          </AccordionDetails>
        </StyledAccordion>
      )}

      {/* Control Plan Creation Dialog */}
      <Dialog open={planDialog} onClose={() => setPlanDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Kontrol Planı Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            mt: 1 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Plan Numarası *"
                value={newPlan.planNumber}
                onChange={(e) => setNewPlan({...newPlan, planNumber: e.target.value})}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Parça Numarası *"
                value={newPlan.partNumber}
                onChange={(e) => setNewPlan({...newPlan, partNumber: e.target.value})}
              />
            </Box>
            <Box sx={{ 
              flex: '1 1 100%'
            }}>
              <TextField
                fullWidth
                label="Parça Adı *"
                value={newPlan.partName}
                onChange={(e) => setNewPlan({...newPlan, partName: e.target.value})}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Teknik Resim Numarası"
                value={newPlan.drawingNumber}
                onChange={(e) => setNewPlan({...newPlan, drawingNumber: e.target.value})}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Revizyon"
                value={newPlan.revision}
                onChange={(e) => setNewPlan({...newPlan, revision: e.target.value})}
              />
            </Box>
            <Box sx={{ 
              flex: '1 1 100%'
            }}>
              <TextField
                fullWidth
                label="Müşteri Adı"
                value={newPlan.customerName}
                onChange={(e) => setNewPlan({...newPlan, customerName: e.target.value})}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialog(false)}>İptal</Button>
          <Button 
            onClick={handleCreateControlPlan}
            variant="contained"
            disabled={!newPlan.planNumber || !newPlan.partNumber || !newPlan.partName}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Control Point Creation Dialog */}
      <Dialog open={pointDialog} onClose={() => setPointDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Kontrol Noktası Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            mt: 1 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                type="number"
                label="Sıra Numarası *"
                value={newControlPoint.sequence}
                onChange={(e) => setNewControlPoint({...newControlPoint, sequence: parseInt(e.target.value)})}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <FormControl fullWidth>
                <InputLabel>Kritiklik Seviyesi *</InputLabel>
                <Select
                  value={newControlPoint.criticalityLevel}
                  onChange={(e) => {
                    const criticalityLevel = e.target.value as any;
                    const frequency = getFrequencyByCriticality(criticalityLevel);
                    setNewControlPoint({
                      ...newControlPoint, 
                      criticalityLevel: criticalityLevel,
                      frequency: frequency
                    });
                  }}
                >
                  <MenuItem value="MINOR">MINOR - Küçük</MenuItem>
                  <MenuItem value="MAJOR">MAJOR - Büyük</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL - Kritik</MenuItem>
                  <MenuItem value="FUNCTIONAL">FUNCTIONAL - İşlevsel</MenuItem>
                  <MenuItem value="SAFETY">SAFETY - Güvenlik</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ 
              flex: '1 1 100%'
            }}>
              <TextField
                fullWidth
                label="Karakteristik (Ölçülecek Özellik) *"
                value={newControlPoint.characteristic}
                onChange={(e) => setNewControlPoint({...newControlPoint, characteristic: e.target.value})}
                helperText="Dış Çap, Boy, Kalınlık, Parallellik gibi özellikler"
              />
            </Box>
            <Box sx={{ 
              flex: '1 1 100%'
            }}>
              <TextField
                fullWidth
                label="Spesifikasyon *"
                value={newControlPoint.specification}
                onChange={(e) => setNewControlPoint({...newControlPoint, specification: e.target.value})}
                helperText="Teknik resimden spesifikasyon"
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 30%' },
              minWidth: '150px'
            }}>
              <TextField
                fullWidth
                type="number"
                label="Nominal Değer *"
                value={newControlPoint.tolerance?.nominalValue}
                onChange={(e) => setNewControlPoint({
                  ...newControlPoint, 
                  tolerance: {
                    ...newControlPoint.tolerance!,
                    nominalValue: parseFloat(e.target.value)
                  }
                })}
                inputProps={{ step: 0.01 }}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 30%' },
              minWidth: '150px'
            }}>
              <TextField
                fullWidth
                type="number"
                label="Alt Limit *"
                value={newControlPoint.tolerance?.lowerLimit}
                onChange={(e) => setNewControlPoint({
                  ...newControlPoint, 
                  tolerance: {
                    ...newControlPoint.tolerance!,
                    lowerLimit: parseFloat(e.target.value)
                  }
                })}
                inputProps={{ step: 0.01 }}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 30%' },
              minWidth: '150px'
            }}>
              <TextField
                fullWidth
                type="number"
                label="Üst Limit *"
                value={newControlPoint.tolerance?.upperLimit}
                onChange={(e) => setNewControlPoint({
                  ...newControlPoint, 
                  tolerance: {
                    ...newControlPoint.tolerance!,
                    upperLimit: parseFloat(e.target.value)
                  }
                })}
                inputProps={{ step: 0.01 }}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Ölçüm Yöntemi *"
                value={newControlPoint.measurementMethod}
                onChange={(e) => setNewControlPoint({...newControlPoint, measurementMethod: e.target.value})}
                helperText="Kumpas ile ölçüm, Mikrometre gibi yöntemler"
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Ölçüm Ekipmanı *"
                value={newControlPoint.equipment}
                onChange={(e) => setNewControlPoint({...newControlPoint, equipment: e.target.value})}
                helperText="Digital Kumpas 0.01mm gibi ekipmanlar"
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                label="Ölçüm Sıklığı (Otomatik)"
                value={newControlPoint.frequency}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Kritiklik seviyesine göre otomatik belirlenir"
              />
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 45%' },
              minWidth: '200px'
            }}>
              <TextField
                fullWidth
                type="number"
                label="Numune Boyutu"
                value={newControlPoint.sampleSize}
                onChange={(e) => setNewControlPoint({...newControlPoint, sampleSize: parseInt(e.target.value)})}
                helperText="Kaç adet ölçülecek"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPointDialog(false)}>İptal</Button>
          <Button 
            onClick={handleAddControlPoint}
            variant="contained"
            disabled={!newControlPoint.characteristic || !newControlPoint.specification}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DimensionalControl; 