import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Straighten as StraightenIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Interfaces
interface ControlPoint {
  id: string;
  characteristic: string;
  characteristicType: 'MINOR' | 'FUNCTIONAL' | 'CRITICAL' | 'SAFETY';
  specification: string;
  nominalValue?: number;
  upperLimit?: number;
  lowerLimit?: number;
  tolerance: string;
  toleranceType: 'BILATERAL' | 'PLUS_ONLY' | 'MINUS_ONLY' | 'PLUS_MINUS';
  toleranceValue: number;
  toleranceValuePlus?: number;
  toleranceValueMinus?: number;
  measurementMethod: string;
  equipment: string;
  frequency?: string;
  notes?: string;
}

interface PartControlPlan {
  id: string;
  partNumber: string;
  partName: string;
  revision: string;
  drawingNumber?: string;
  materialSpec?: string;
  controlPoints: ControlPoint[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  },
}));

// Constants
const PREDEFINED_CHARACTERISTICS = [
  { name: 'Dış Çap', method: 'Kumpas ile ölçüm', equipment: 'Dijital Kumpas' },
  { name: 'İç Çap', method: 'İç çap kumpası ile ölçüm', equipment: 'İç Çap Kumpası' },
  { name: 'Boy/Uzunluk', method: 'Kumpas ile ölçüm', equipment: 'Dijital Kumpas' },
  { name: 'Genişlik', method: 'Kumpas ile ölçüm', equipment: 'Dijital Kumpas' },
  { name: 'Kalınlık', method: 'Kumpas ile ölçüm', equipment: 'Dijital Kumpas' },
  { name: 'Delik Çapı', method: 'İç çap kumpası ile ölçüm', equipment: 'İç Çap Kumpası' },
  { name: 'Delik Derinliği', method: 'Derinlik ölçer ile ölçüm', equipment: 'Derinlik Ölçer' },
  { name: 'Vida Çapı', method: 'Vida kumpası ile ölçüm', equipment: 'Vida Kumpası' },
  { name: 'Vida Adımı', method: 'Vida adım ölçer ile ölçüm', equipment: 'Vida Adım Ölçer' },
  { name: 'Açı', method: 'Açı ölçer ile ölçüm', equipment: 'Dijital Açı Ölçer' },
  { name: 'Düzlük', method: 'Düzlük ölçer ile ölçüm', equipment: 'Düzlük Ölçer' },
  { name: 'Parallellik', method: 'Mikrometre ile ölçüm', equipment: 'Dijital Mikrometre' },
  { name: 'Dik Açılılık', method: 'Dik açı ölçer ile ölçüm', equipment: 'Dik Açı Ölçer' },
  { name: 'Konsantriklik', method: 'CMM ile ölçüm', equipment: 'Koordinat Ölçme Makinesi' },
  { name: 'Yuvarlak Çap', method: 'CMM ile ölçüm', equipment: 'Koordinat Ölçme Makinesi' },
  { name: 'Silindiriklik', method: 'CMM ile ölçüm', equipment: 'Koordinat Ölçme Makinesi' },
  { name: 'Pürüzlülük', method: 'Pürüzlülük ölçer ile ölçüm', equipment: 'Yüzey Pürüzlülük Ölçer' },
  { name: 'Sertlik', method: 'Sertlik ölçer ile ölçüm', equipment: 'Dijital Sertlik Ölçer' },
  { name: 'Konum Toleransı', method: 'CMM ile ölçüm', equipment: 'Koordinat Ölçme Makinesi' },
  { name: 'Form Toleransı', method: 'CMM ile ölçüm', equipment: 'Koordinat Ölçme Makinesi' },
];

const TOLERANCE_TYPES = [
  { value: 'BILATERAL', label: '± (İki Yönlü)' },
  { value: 'PLUS_ONLY', label: '+ (Sadece Artı)' },
  { value: 'MINUS_ONLY', label: '- (Sadece Eksi)' },
  { value: 'PLUS_MINUS', label: '+/- (Farklı Artı/Eksi)' }
];

const CHARACTERISTIC_TYPES = [
  { value: 'MINOR', label: 'Minor', color: '#4caf50' },
  { value: 'FUNCTIONAL', label: 'Fonksiyonel', color: '#2196f3' },
  { value: 'CRITICAL', label: 'Kritik', color: '#ff9800' },
  { value: 'SAFETY', label: 'Emniyet', color: '#f44336' }
];

const DimensionalControlSystem: React.FC = () => {
  // State variables
  const [partPlans, setPartPlans] = useState<PartControlPlan[]>([]);
  const [selectedPartPlan, setSelectedPartPlan] = useState<PartControlPlan | null>(null);
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [partSearchTerm, setPartSearchTerm] = useState('');
  
  // Dialog states
  const [partPlanDialog, setPartPlanDialog] = useState(false);
  const [controlPointDialog, setControlPointDialog] = useState(false);
  const [editPartPlanDialog, setEditPartPlanDialog] = useState(false);

  // Form data states
  const [newPartPlan, setNewPartPlan] = useState({
    partNumber: '',
    partName: '',
    revision: '',
    drawingNumber: '',
    materialSpec: ''
  });

  const [editingPlan, setEditingPlan] = useState<PartControlPlan | null>(null);
  const [editControlPoints, setEditControlPoints] = useState<ControlPoint[]>([]);
  const [bulkControlPoints, setBulkControlPoints] = useState<Partial<ControlPoint>[]>([]);
  const [addControlPointsBulk, setAddControlPointsBulk] = useState<Partial<ControlPoint>[]>([]);
  const [bulkCount, setBulkCount] = useState(5);
  const [addControlPointsCount, setAddControlPointsCount] = useState(3);

  // Karakteristik tipine göre renk alma fonksiyonu
  const getCharacteristicTypeColor = (characteristicType: string): string => {
    const type = CHARACTERISTIC_TYPES.find(t => t.value === characteristicType);
    return type?.color || '#2196f3';
  };

  // Karakteristik tipine göre otomatik frekans belirleme
  const getFrequencyByCharacteristicType = (characteristicType: string): string => {
    switch (characteristicType) {
      case 'MINOR':
        return 'Her partiden 1 adet';
      case 'FUNCTIONAL':
        return '5 üründen 1 adet';
      case 'CRITICAL':
        return '3 üründen 1 adet';
      case 'SAFETY':
        return 'Her üründen 1 adet';
      default:
        return '2 üründen 1 adet';
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPartControlPlans();
  }, []);

  // Update control points when part plan changes
  useEffect(() => {
    if (selectedPartPlan) {
      setControlPoints(selectedPartPlan.controlPoints);
    } else {
      setControlPoints([]);
    }
  }, [selectedPartPlan]);

  // Filtered part plans based on search
  const filteredPartPlans = useMemo(() => {
    if (!partSearchTerm) return partPlans;
    return partPlans.filter(plan =>
      plan.partNumber.toLowerCase().includes(partSearchTerm.toLowerCase()) ||
      plan.partName.toLowerCase().includes(partSearchTerm.toLowerCase())
    );
  }, [partPlans, partSearchTerm]);

  // Functions
  const loadPartControlPlans = () => {
    const savedPlans = localStorage.getItem('partControlPlans');
    if (savedPlans) {
      setPartPlans(JSON.parse(savedPlans));
    }
  };

  const savePartControlPlans = (plans: PartControlPlan[]) => {
    localStorage.setItem('partControlPlans', JSON.stringify(plans));
    setPartPlans(plans);
  };

  const loadPartControlPlan = (plan: PartControlPlan) => {
    setSelectedPartPlan(plan);
  };

  const deletePartControlPlan = (planId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Bu kontrol planını silmek istediğinizden emin misiniz?')) {
      const updatedPlans = partPlans.filter(plan => plan.id !== planId);
      savePartControlPlans(updatedPlans);
      if (selectedPartPlan?.id === planId) {
        setSelectedPartPlan(null);
      }
    }
  };

  const editPartControlPlan = (plan: PartControlPlan) => {
    setEditingPlan(plan);
    setEditControlPoints([...plan.controlPoints]);
    setEditPartPlanDialog(true);
  };

  const saveEditedPartControlPlan = () => {
    if (!editingPlan) return;

    const updatedPlan = {
      ...editingPlan,
      controlPoints: editControlPoints,
      lastModified: new Date().toISOString()
    };

    const updatedPlans = partPlans.map(plan =>
      plan.id === editingPlan.id ? updatedPlan : plan
    );

    savePartControlPlans(updatedPlans);

    if (selectedPartPlan?.id === editingPlan.id) {
      setSelectedPartPlan(updatedPlan);
    }

    setEditPartPlanDialog(false);
    setEditingPlan(null);
    setEditControlPoints([]);
  };

  const deleteControlPoint = (pointId: string) => {
    if (!selectedPartPlan) return;

    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Bu kontrol noktasını silmek istediğinizden emin misiniz?')) {
      const updatedControlPoints = controlPoints.filter(point => point.id !== pointId);
      const updatedPlan = {
        ...selectedPartPlan,
        controlPoints: updatedControlPoints,
        lastModified: new Date().toISOString()
      };

      const updatedPlans = partPlans.map(plan =>
        plan.id === selectedPartPlan.id ? updatedPlan : plan
      );

      savePartControlPlans(updatedPlans);
      setSelectedPartPlan(updatedPlan);
    }
  };

  const calculateLimits = (
    nominal: number,
    toleranceType: string,
    toleranceValue: number,
    toleranceValuePlus?: number,
    toleranceValueMinus?: number
  ) => {
    let upper = nominal;
    let lower = nominal;

    switch (toleranceType) {
      case 'BILATERAL':
        upper = nominal + toleranceValue;
        lower = nominal - toleranceValue;
        break;
      case 'PLUS_MINUS':
        upper = nominal + (toleranceValuePlus || toleranceValue);
        lower = nominal - (toleranceValueMinus || toleranceValue);
        break;
      case 'PLUS_ONLY':
        upper = nominal + toleranceValue;
        lower = nominal;
        break;
      case 'MINUS_ONLY':
        upper = nominal;
        lower = nominal - toleranceValue;
        break;
    }

    return { upper, lower };
  };

  const initializeBulkControlPoints = (count: number) => {
    const points: Partial<ControlPoint>[] = Array.from({ length: count }, () => ({
      characteristic: '',
      characteristicType: 'FUNCTIONAL',
      specification: '',
      nominalValue: undefined,
      tolerance: '',
      toleranceType: 'BILATERAL',
      toleranceValue: 0,
      toleranceValuePlus: undefined,
      toleranceValueMinus: undefined,
      upperLimit: undefined,
      lowerLimit: undefined,
      measurementMethod: '',
      equipment: '',
      frequency: '5 üründen 1 adet',
      notes: ''
    }));
    setBulkControlPoints(points);
  };

  const updateBulkControlPoint = (index: number, field: string, value: any) => {
    const updated = [...bulkControlPoints];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill measurement method and equipment when characteristic is selected
    if (field === 'characteristic') {
      const predefinedChar = PREDEFINED_CHARACTERISTICS.find(char => char.name === value);
      if (predefinedChar) {
        updated[index].measurementMethod = predefinedChar.method;
        updated[index].equipment = predefinedChar.equipment;
      }
    }

    // Auto-set frequency when characteristic type changes
    if (field === 'characteristicType') {
      updated[index].frequency = getFrequencyByCharacteristicType(value as string);
    }
    
    // Calculate limits when relevant fields change
    if (['nominalValue', 'toleranceType', 'toleranceValue', 'toleranceValuePlus', 'toleranceValueMinus'].includes(field)) {
      const point = updated[index];
      if (point.nominalValue !== undefined && point.toleranceValue !== undefined) {
        const limits = calculateLimits(
          point.nominalValue,
          point.toleranceType as string,
          point.toleranceValue,
          point.toleranceValuePlus,
          point.toleranceValueMinus
        );
        updated[index].upperLimit = limits.upper;
        updated[index].lowerLimit = limits.lower;
      }
    }
    
    setBulkControlPoints(updated);
  };

  const createBulkControlPoints = () => {
    // First validate part plan information
    if (!newPartPlan.partNumber || !newPartPlan.partName) {
      alert('Parça numarası ve adı zorunludur!');
      return;
    }

    const validPoints = bulkControlPoints.filter(point => 
      point.characteristic && point.nominalValue !== undefined && point.toleranceValue !== undefined
    );

    if (validPoints.length === 0) {
      alert('En az bir geçerli kontrol noktası girmelisiniz!');
      return;
    }

    // Create the new control points
    const newControlPoints: ControlPoint[] = validPoints.map((point, index) => {
      const controlPoint: ControlPoint = {
        id: (Date.now() + index).toString(),
        characteristic: point.characteristic || '',
        characteristicType: point.characteristicType as 'MINOR' | 'FUNCTIONAL' | 'CRITICAL' | 'SAFETY',
        specification: `${point.characteristic} - Nominal: ${point.nominalValue}mm, Tolerans: ${point.toleranceType === 'PLUS_MINUS' ? `+${point.toleranceValuePlus || point.toleranceValue}/-${point.toleranceValueMinus || point.toleranceValue}` : `±${point.toleranceValue}`}mm`,
        nominalValue: point.nominalValue,
        tolerance: point.toleranceType === 'PLUS_MINUS' ? `+${point.toleranceValuePlus || point.toleranceValue}/-${point.toleranceValueMinus || point.toleranceValue}mm` : `±${point.toleranceValue}mm`,
        toleranceType: point.toleranceType as 'BILATERAL' | 'PLUS_ONLY' | 'MINUS_ONLY' | 'PLUS_MINUS',
        toleranceValue: point.toleranceValue || 0,
        toleranceValuePlus: point.toleranceValuePlus,
        toleranceValueMinus: point.toleranceValueMinus,
        measurementMethod: point.measurementMethod || '',
        equipment: point.equipment || '',
        notes: point.notes || '',
        frequency: point.frequency || '2 üründen 1 adet'
      };

      // Calculate limits
      const limits = calculateLimits(
        controlPoint.nominalValue || 0,
        controlPoint.toleranceType,
        controlPoint.toleranceValue,
        controlPoint.toleranceValuePlus,
        controlPoint.toleranceValueMinus
      );
      
      controlPoint.upperLimit = limits.upper;
      controlPoint.lowerLimit = limits.lower;

      return controlPoint;
    });

    // Create the new part plan with control points
    const newPlan: PartControlPlan = {
      id: Date.now().toString(),
      ...newPartPlan,
      controlPoints: newControlPoints,
      createdBy: 'Mevcut Kullanıcı',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedPlans = [...partPlans, newPlan];
    savePartControlPlans(updatedPlans);
    
    // Set the new plan as selected
    setSelectedPartPlan(newPlan);
    
    // Close dialog and reset form
    setPartPlanDialog(false);
    setNewPartPlan({
      partNumber: '',
      partName: '',
      revision: '',
      drawingNumber: '',
      materialSpec: ''
    });
    setBulkCount(5);
    setBulkControlPoints([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setPartPlanDialog(true);
            initializeBulkControlPoints(bulkCount);
          }}
        >
          Yeni Kontrol Planı
        </Button>
      </Box>

      {/* Part Plans Management */}
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Parça Bazlı Kontrol Planları</Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam: {partPlans.length} plan
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            variant="outlined"
            label="Parça Ara (Parça Numarası veya Adı)"
            placeholder="Parça numarası veya adını yazın..."
            value={partSearchTerm}
            onChange={(e) => setPartSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: partSearchTerm && (
                <IconButton
                  size="small"
                  onClick={() => setPartSearchTerm('')}
                >
                  <ClearIcon />
                </IconButton>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* Parts List */}
          {filteredPartPlans.length > 0 ? (
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Parça Numarası</TableCell>
                    <TableCell>Parça Adı</TableCell>
                    <TableCell>Revizyon</TableCell>
                    <TableCell align="center">Kontrol Noktası</TableCell>
                    <TableCell>Son Güncelleme</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPartPlans.map((plan) => (
                    <TableRow 
                      key={plan.id}
                      sx={{ 
                        backgroundColor: selectedPartPlan?.id === plan.id ? '#e8f5e8' : 'inherit',
                        border: selectedPartPlan?.id === plan.id ? '2px solid #4caf50' : 'none',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {plan.partNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{plan.partName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={plan.revision || 'Rev 1'} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Badge badgeContent={plan.controlPoints.length} color="primary">
                          <StraightenIcon color="action" />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(plan.lastModified).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => loadPartControlPlan(plan)}
                            color={selectedPartPlan?.id === plan.id ? 'secondary' : 'primary'}
                          >
                            {selectedPartPlan?.id === plan.id ? 'Aktif' : 'Seç'}
                          </Button>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => editPartControlPlan(plan)}
                            title="Planı Düzenle"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deletePartControlPlan(plan.id)}
                            title="Planı Sil"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              {partSearchTerm ? 
                `"${partSearchTerm}" araması için sonuç bulunamadı.` : 
                'Henüz kontrol planı oluşturulmamış.'
              }
            </Alert>
          )}
        </CardContent>
      </StyledCard>

      {/* Active Plan Info */}
      {selectedPartPlan && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <strong>Aktif Kontrol Planı:</strong> {selectedPartPlan.partNumber} - {selectedPartPlan.partName}
              <br />
              <Typography variant="caption">
                {selectedPartPlan.controlPoints.length} kontrol noktası | 
                Revizyon: {selectedPartPlan.revision || 'Rev 1'} |
                Son Güncelleme: {new Date(selectedPartPlan.lastModified).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setControlPointDialog(true);
                setAddControlPointsBulk(Array.from({ length: addControlPointsCount }, () => ({
                  characteristic: '',
                  characteristicType: 'FUNCTIONAL',
                  specification: '',
                  nominalValue: undefined,
                  tolerance: '',
                  toleranceType: 'BILATERAL',
                  toleranceValue: 0,
                  toleranceValuePlus: undefined,
                  toleranceValueMinus: undefined,
                  upperLimit: undefined,
                  lowerLimit: undefined,
                  measurementMethod: '',
                  equipment: '',
                  notes: ''
                })));
              }}
              size="small"
            >
              Kontrol Noktası Ekle
            </Button>
          </Box>
        </Alert>
      )}

      {/* Control Points */}
      {selectedPartPlan && (
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Kontrol Noktaları</Typography>
              <Typography variant="body2" color="text.secondary">
                {controlPoints.length} nokta tanımlı
              </Typography>
            </Box>

            {controlPoints.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tür</TableCell>
                      <TableCell>Karakteristik Özellik</TableCell>
                      <TableCell>Nominal</TableCell>
                      <TableCell>Tolerans</TableCell>
                      <TableCell>Limitler</TableCell>
                      <TableCell>Ölçüm Yöntemi</TableCell>
                      <TableCell>Ekipman</TableCell>
                      <TableCell>Ölçüm Gereksinimi</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {controlPoints.map((point) => (
                      <TableRow key={point.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {point.characteristic}
                          </Typography>
                          {point.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {point.notes}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={CHARACTERISTIC_TYPES.find(t => t.value === point.characteristicType)?.label || point.characteristicType}
                            size="small"
                            sx={{
                              backgroundColor: getCharacteristicTypeColor(point.characteristicType),
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {point.nominalValue !== undefined ? `${point.nominalValue} mm` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {point.tolerance}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            Alt: {point.lowerLimit !== undefined ? point.lowerLimit : '-'}<br/>
                            Üst: {point.upperLimit !== undefined ? point.upperLimit : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {point.measurementMethod}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {point.equipment}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={point.frequency || getFrequencyByCharacteristicType(point.characteristicType || 'FUNCTIONAL')}
                            size="small"
                            variant="filled"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              minWidth: '120px',
                              backgroundColor: getCharacteristicTypeColor(point.characteristicType),
                              color: 'white',
                              '& .MuiChip-label': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteControlPoint(point.id)}
                            title="Kontrol Noktasını Sil"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="warning">
                Bu kontrol planında henüz kontrol noktası tanımlanmamış.
              </Alert>
            )}
          </CardContent>
        </StyledCard>
      )}

      {/* No Plan Selected */}
      {!selectedPartPlan && (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Kontrol Planı Seçin
          </Typography>
          <Typography>
            Boyutsal kontrol işlemlerine başlamak için yukarıdan bir kontrol planı seçin veya yeni plan oluşturun.
          </Typography>
        </Alert>
      )}

      {/* Create Part Plan Dialog */}
      <Dialog open={partPlanDialog} onClose={() => setPartPlanDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StraightenIcon color="primary" />
            <Typography variant="h5">Yeni Kontrol Planı Oluştur</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Part Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              1. Parça Bilgileri
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Parça Numarası *"
                  value={newPartPlan.partNumber}
                  onChange={(e) => setNewPartPlan({...newPartPlan, partNumber: e.target.value})}
                  required
                  helperText="Benzersiz parça numarası"
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Parça Adı *"
                  value={newPartPlan.partName}
                  onChange={(e) => setNewPartPlan({...newPartPlan, partName: e.target.value})}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Revizyon"
                  value={newPartPlan.revision}
                  onChange={(e) => setNewPartPlan({...newPartPlan, revision: e.target.value})}
                  helperText="Rev A, Rev B vb."
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Teknik Resim Numarası"
                  value={newPartPlan.drawingNumber}
                  onChange={(e) => setNewPartPlan({...newPartPlan, drawingNumber: e.target.value})}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Malzeme Spesifikasyonu"
                  value={newPartPlan.materialSpec}
                  onChange={(e) => setNewPartPlan({...newPartPlan, materialSpec: e.target.value})}
                  helperText="ST37, 304L, AlMg3 vb."
                />
              </Box>
            </Box>
          </Box>

          {/* Control Points Count Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              2. Kontrol Noktası Sayısı
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TextField
                type="number"
                label="Kaç adet ölçüm noktası?"
                value={bulkCount}
                onChange={(e) => {
                  const count = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                  setBulkCount(count);
                  initializeBulkControlPoints(count);
                }}
                inputProps={{ min: 1, max: 50 }}
                sx={{ width: 200 }}
                helperText="1-50 arası seçin"
              />
              <Typography variant="body2" color="text.secondary">
                Bu sayı kadar kontrol noktası oluşturulacak ve aşağıda tablo halinde görüntülenecek.
              </Typography>
            </Box>
          </Box>

          {/* Bulk Control Points Table */}
          {bulkControlPoints.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                3. Kontrol Noktalarını Tanımlayın ({bulkControlPoints.length} adet)
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell sx={{ minWidth: 200 }}>Tür *</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Karakteristik Özellik *</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Nominal *</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Tolerans Türü *</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Tolerans *</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Üst Limit</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Alt Limit</TableCell>
                      <TableCell sx={{ minWidth: 200 }}>Ölçüm Yöntemi</TableCell>
                      <TableCell sx={{ minWidth: 200 }}>Ekipman</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Ölçüm Frekansı (Otomatik)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkControlPoints.map((point, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={point.characteristic || ''}
                              onChange={(e) => updateBulkControlPoint(index, 'characteristic', e.target.value)}
                            >
                              {PREDEFINED_CHARACTERISTICS.map((char) => (
                                <MenuItem key={char.name} value={char.name}>{char.name}</MenuItem>
                              ))}
                              <MenuItem value="custom">Diğer (Manuel Giriş)</MenuItem>
                            </Select>
                          </FormControl>
                          {point.characteristic === 'custom' && (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Özel karakteristik"
                              sx={{ mt: 1 }}
                              onChange={(e) => updateBulkControlPoint(index, 'characteristic', e.target.value)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={point.characteristicType || 'FUNCTIONAL'}
                              onChange={(e) => {
                                const updated = [...bulkControlPoints];
                                updated[index] = { 
                                  ...updated[index], 
                                  characteristicType: e.target.value as 'MINOR' | 'FUNCTIONAL' | 'CRITICAL' | 'SAFETY',
                                  frequency: getFrequencyByCharacteristicType(e.target.value)
                                };
                                setBulkControlPoints(updated);
                              }}
                            >
                              <MenuItem value="MINOR">Minor</MenuItem>
                              <MenuItem value="FUNCTIONAL">FONKSİYONEL</MenuItem>
                              <MenuItem value="CRITICAL">KRİTİK</MenuItem>
                              <MenuItem value="SAFETY">EMNİYET</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={point.nominalValue !== undefined ? point.nominalValue : ''}
                            onChange={(e) => updateBulkControlPoint(index, 'nominalValue', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            inputProps={{ 
                              step: 0.001,
                              min: 0
                            }}
                            placeholder="0.000"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={point.toleranceType || 'BILATERAL'}
                              onChange={(e) => updateBulkControlPoint(index, 'toleranceType', e.target.value as 'BILATERAL' | 'PLUS_ONLY' | 'MINUS_ONLY' | 'PLUS_MINUS')}
                            >
                              {TOLERANCE_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          {point.toleranceType === 'PLUS_MINUS' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <TextField
                                size="small"
                                type="number"
                                placeholder="Artı (0.000)"
                                value={point.toleranceValuePlus !== undefined ? point.toleranceValuePlus : ''}
                                onChange={(e) => updateBulkControlPoint(index, 'toleranceValuePlus', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                inputProps={{ 
                                  step: 0.001,
                                  min: 0
                                }}
                              />
                              <TextField
                                size="small"
                                type="number"
                                placeholder="Eksi (0.000)"
                                value={point.toleranceValueMinus !== undefined ? point.toleranceValueMinus : ''}
                                onChange={(e) => updateBulkControlPoint(index, 'toleranceValueMinus', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                inputProps={{ 
                                  step: 0.001,
                                  min: 0
                                }}
                              />
                            </Box>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={point.toleranceValue !== undefined ? point.toleranceValue : ''}
                              onChange={(e) => updateBulkControlPoint(index, 'toleranceValue', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              inputProps={{ 
                                step: 0.001,
                                min: 0
                              }}
                              placeholder="0.000"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={point.upperLimit !== undefined ? point.upperLimit : ''}
                            InputProps={{ readOnly: true }}
                            sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={point.lowerLimit !== undefined ? point.lowerLimit : ''}
                            InputProps={{ readOnly: true }}
                            sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={point.measurementMethod || ''}
                            onChange={(e) => updateBulkControlPoint(index, 'measurementMethod', e.target.value)}
                            InputProps={{ 
                              readOnly: PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic)
                            }}
                            sx={PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic) ? 
                              { '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } } : {}}
                            placeholder="Ölçüm yöntemi"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={point.equipment || ''}
                            onChange={(e) => updateBulkControlPoint(index, 'equipment', e.target.value)}
                            InputProps={{ 
                              readOnly: PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic)
                            }}
                            sx={PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic) ? 
                              { '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } } : {}}
                            placeholder="Ölçüm ekipmanı"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            label="Ölçüm Frekansı (Otomatik)"
                            value={point.frequency || getFrequencyByCharacteristicType(point.characteristicType || 'FUNCTIONAL')}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                            helperText="Karakteristik tipine göre otomatik"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPartPlanDialog(false);
            setNewPartPlan({
              partNumber: '',
              partName: '',
              revision: '',
              drawingNumber: '',
              materialSpec: ''
            });
            setBulkCount(5);
            setBulkControlPoints([]);
          }}>
            İptal
          </Button>
          <Button 
            onClick={createBulkControlPoints} 
            variant="contained"
            disabled={!newPartPlan.partNumber || !newPartPlan.partName}
          >
            Kontrol Planını Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Part Plan Dialog */}
      <Dialog open={editPartPlanDialog} onClose={() => setEditPartPlanDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EditIcon color="primary" />
            <Typography variant="h5">Kontrol Planını Düzenle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editingPlan && (
            <>
              {/* Part Information */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Parça Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      fullWidth
                      label="Parça Numarası *"
                      value={editingPlan.partNumber}
                      onChange={(e) => setEditingPlan({...editingPlan, partNumber: e.target.value})}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      fullWidth
                      label="Parça Adı *"
                      value={editingPlan.partName}
                      onChange={(e) => setEditingPlan({...editingPlan, partName: e.target.value})}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      fullWidth
                      label="Revizyon"
                      value={editingPlan.revision}
                      onChange={(e) => setEditingPlan({...editingPlan, revision: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      fullWidth
                      label="Teknik Resim Numarası"
                      value={editingPlan.drawingNumber || ''}
                      onChange={(e) => setEditingPlan({...editingPlan, drawingNumber: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      fullWidth
                      label="Malzeme Spesifikasyonu"
                      value={editingPlan.materialSpec || ''}
                      onChange={(e) => setEditingPlan({...editingPlan, materialSpec: e.target.value})}
                      helperText="ST37, 304L, AlMg3 vb."
                    />
                  </Box>
                </Box>
              </Box>

              {/* Control Points */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Kontrol Noktaları ({editControlPoints.length} adet)
                </Typography>
                {editControlPoints.length > 0 ? (
                  <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tür</TableCell>
                          <TableCell>Karakteristik Özellik</TableCell>
                          <TableCell>Nominal</TableCell>
                          <TableCell>Tolerans</TableCell>
                          <TableCell>Ölçüm Yöntemi</TableCell>
                          <TableCell>Ekipman</TableCell>
                          <TableCell>Ölçüm Frekansı</TableCell>
                          <TableCell align="center">İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {editControlPoints.map((point, index) => (
                          <TableRow key={point.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {point.characteristic}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={CHARACTERISTIC_TYPES.find(t => t.value === point.characteristicType)?.label || point.characteristicType}
                                size="small"
                                sx={{
                                  backgroundColor: getCharacteristicTypeColor(point.characteristicType),
                                  color: 'white',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {point.nominalValue !== undefined ? `${point.nominalValue} mm` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {point.tolerance}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {point.measurementMethod}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {point.equipment}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={point.frequency || getFrequencyByCharacteristicType(point.characteristicType || 'FUNCTIONAL')}
                                size="small"
                                variant="filled"
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  minWidth: '120px',
                                  backgroundColor: getCharacteristicTypeColor(point.characteristicType),
                                  color: 'white',
                                  '& .MuiChip-label': {
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  const updatedPoints = editControlPoints.filter((_, i) => i !== index);
                                  setEditControlPoints(updatedPoints);
                                }}
                                title="Kontrol Noktasını Sil"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    Bu kontrol planında henüz kontrol noktası tanımlanmamış.
                  </Alert>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditPartPlanDialog(false);
            setEditingPlan(null);
            setEditControlPoints([]);
          }}>
            İptal
          </Button>
          <Button 
            onClick={saveEditedPartControlPlan} 
            variant="contained"
            disabled={!editingPlan?.partNumber || !editingPlan?.partName}
          >
            Değişiklikleri Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Control Point Dialog */}
      <Dialog open={controlPointDialog} onClose={() => setControlPointDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Kontrol Noktalarını Tanımlayın</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Nokta Sayısı:</Typography>
              <TextField
                type="number"
                size="small"
                value={addControlPointsCount}
                onChange={(e) => {
                  const count = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                  setAddControlPointsCount(count);
                  setAddControlPointsBulk(Array.from({ length: count }, (_, index) => 
                    addControlPointsBulk[index] || {
                      characteristic: '',
                      characteristicType: 'FUNCTIONAL',
                      specification: '',
                      nominalValue: undefined,
                      tolerance: '',
                      toleranceType: 'BILATERAL',
                      toleranceValue: 0,
                      toleranceValuePlus: undefined,
                      toleranceValueMinus: undefined,
                      upperLimit: undefined,
                      lowerLimit: undefined,
                      measurementMethod: '',
                      equipment: '',
                      notes: ''
                    }
                  ));
                }}
                inputProps={{ min: 1, max: 20 }}
                sx={{ width: 80 }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Seçili kontrol planına eklenecek kontrol noktalarını tanımlayın. ({addControlPointsCount} adet)
          </Typography>
          
          {addControlPointsBulk.length > 0 && (
            <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Tür *</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Karakteristik Özellik *</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Nominal *</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Tolerans Türü *</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Tolerans *</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Üst Limit</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Alt Limit</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Ölçüm Yöntemi</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Ekipman</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Ölçüm Frekansı (Otomatik)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addControlPointsBulk.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={point.characteristic || ''}
                            onChange={(e) => {
                              const updated = [...addControlPointsBulk];
                              updated[index] = { ...updated[index], characteristic: e.target.value };
                              
                              // Auto-fill measurement method and equipment
                              const predefinedChar = PREDEFINED_CHARACTERISTICS.find(char => char.name === e.target.value);
                              if (predefinedChar) {
                                updated[index].measurementMethod = predefinedChar.method;
                                updated[index].equipment = predefinedChar.equipment;
                              }
                              
                              setAddControlPointsBulk(updated);
                            }}
                          >
                            {PREDEFINED_CHARACTERISTICS.map((char) => (
                              <MenuItem key={char.name} value={char.name}>{char.name}</MenuItem>
                            ))}
                            <MenuItem value="custom">Diğer (Manuel Giriş)</MenuItem>
                          </Select>
                        </FormControl>
                        {point.characteristic === 'custom' && (
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Özel karakteristik"
                            sx={{ mt: 1 }}
                            onChange={(e) => {
                              const updated = [...addControlPointsBulk];
                              updated[index] = { ...updated[index], characteristic: e.target.value };
                              setAddControlPointsBulk(updated);
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={point.characteristicType || 'FUNCTIONAL'}
                            onChange={(e) => {
                              const updated = [...addControlPointsBulk];
                              updated[index] = { 
                                ...updated[index], 
                                characteristicType: e.target.value as 'MINOR' | 'FUNCTIONAL' | 'CRITICAL' | 'SAFETY',
                                frequency: getFrequencyByCharacteristicType(e.target.value)
                              };
                              setAddControlPointsBulk(updated);
                            }}
                          >
                            <MenuItem value="MINOR">Minor</MenuItem>
                            <MenuItem value="FUNCTIONAL">FONKSİYONEL</MenuItem>
                            <MenuItem value="CRITICAL">KRİTİK</MenuItem>
                            <MenuItem value="SAFETY">EMNİYET</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={point.nominalValue !== undefined ? point.nominalValue : ''}
                          onChange={(e) => {
                            const updated = [...addControlPointsBulk];
                            const newValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            updated[index] = { ...updated[index], nominalValue: newValue };
                            
                            // Calculate limits when nominal value changes
                            if (newValue !== undefined && updated[index].toleranceValue !== undefined) {
                              const limits = calculateLimits(
                                newValue,
                                updated[index].toleranceType || 'BILATERAL',
                                updated[index].toleranceValue || 0,
                                updated[index].toleranceValuePlus,
                                updated[index].toleranceValueMinus
                              );
                              updated[index].upperLimit = limits.upper;
                              updated[index].lowerLimit = limits.lower;
                            }
                            
                            setAddControlPointsBulk(updated);
                          }}
                          inputProps={{ 
                            step: 0.001,
                            min: 0
                          }}
                          placeholder="0.000"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={point.toleranceType || 'BILATERAL'}
                            onChange={(e) => {
                              const updated = [...addControlPointsBulk];
                              updated[index] = { ...updated[index], toleranceType: e.target.value as 'BILATERAL' | 'PLUS_ONLY' | 'MINUS_ONLY' | 'PLUS_MINUS' };
                              setAddControlPointsBulk(updated);
                            }}
                          >
                            {TOLERANCE_TYPES.map((type) => (
                              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {point.toleranceType === 'PLUS_MINUS' ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <TextField
                              size="small"
                              type="number"
                              placeholder="Artı (0.000)"
                              value={point.toleranceValuePlus !== undefined ? point.toleranceValuePlus : ''}
                              onChange={(e) => {
                                const updated = [...addControlPointsBulk];
                                updated[index] = { ...updated[index], toleranceValuePlus: e.target.value === '' ? undefined : parseFloat(e.target.value) };
                                setAddControlPointsBulk(updated);
                              }}
                              inputProps={{ 
                                step: 0.001,
                                min: 0
                              }}
                            />
                            <TextField
                              size="small"
                              type="number"
                              placeholder="Eksi (0.000)"
                              value={point.toleranceValueMinus !== undefined ? point.toleranceValueMinus : ''}
                              onChange={(e) => {
                                const updated = [...addControlPointsBulk];
                                updated[index] = { ...updated[index], toleranceValueMinus: e.target.value === '' ? undefined : parseFloat(e.target.value) };
                                setAddControlPointsBulk(updated);
                              }}
                              inputProps={{ 
                                step: 0.001,
                                min: 0
                              }}
                            />
                          </Box>
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={point.toleranceValue !== undefined ? point.toleranceValue : ''}
                            onChange={(e) => {
                              const updated = [...addControlPointsBulk];
                              const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              updated[index] = { ...updated[index], toleranceValue: newValue };
                              
                              // Calculate limits when tolerance changes
                              if (updated[index].nominalValue !== undefined) {
                                const limits = calculateLimits(
                                  updated[index].nominalValue || 0,
                                  updated[index].toleranceType || 'BILATERAL',
                                  newValue,
                                  updated[index].toleranceValuePlus,
                                  updated[index].toleranceValueMinus
                                );
                                updated[index].upperLimit = limits.upper;
                                updated[index].lowerLimit = limits.lower;
                              }
                              
                              setAddControlPointsBulk(updated);
                            }}
                            inputProps={{ 
                              step: 0.001,
                              min: 0
                            }}
                            placeholder="0.000"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={point.upperLimit !== undefined ? point.upperLimit : ''}
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={point.lowerLimit !== undefined ? point.lowerLimit : ''}
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={point.measurementMethod || ''}
                          onChange={(e) => {
                            const updated = [...addControlPointsBulk];
                            updated[index] = { ...updated[index], measurementMethod: e.target.value };
                            setAddControlPointsBulk(updated);
                          }}
                          InputProps={{ 
                            readOnly: PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic)
                          }}
                          sx={PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic) ? 
                            { '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } } : {}}
                          placeholder="Ölçüm yöntemi"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={point.equipment || ''}
                          onChange={(e) => {
                            const updated = [...addControlPointsBulk];
                            updated[index] = { ...updated[index], equipment: e.target.value };
                            setAddControlPointsBulk(updated);
                          }}
                          InputProps={{ 
                            readOnly: PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic)
                          }}
                          sx={PREDEFINED_CHARACTERISTICS.some(char => char.name === point.characteristic) ? 
                            { '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } } : {}}
                          placeholder="Ölçüm ekipmanı"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          label="Ölçüm Frekansı (Otomatik)"
                          value={point.frequency || getFrequencyByCharacteristicType(point.characteristicType || 'FUNCTIONAL')}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                          helperText="Karakteristik tipine göre otomatik"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setControlPointDialog(false);
            setAddControlPointsBulk([]);
          }}>
            İptal
          </Button>
          <Button 
            onClick={() => {
              // Add multiple control points to selected plan
              const validPoints = addControlPointsBulk.filter(point => 
                point.characteristic && point.nominalValue !== undefined && point.toleranceValue !== undefined
              );

              if (validPoints.length === 0) {
                alert('En az bir geçerli kontrol noktası girmelisiniz!');
                return;
              }

              const newControlPoints: ControlPoint[] = validPoints.map((point, index) => {
                const controlPoint: ControlPoint = {
                  id: (Date.now() + index).toString(),
                  characteristic: point.characteristic || '',
                  characteristicType: point.characteristicType || 'FUNCTIONAL',
                  specification: `${point.characteristic} - Nominal: ${point.nominalValue}mm, Tolerans: ${point.toleranceType === 'PLUS_MINUS' ? `+${point.toleranceValuePlus || point.toleranceValue}/-${point.toleranceValueMinus || point.toleranceValue}` : `±${point.toleranceValue}`}mm`,
                  nominalValue: point.nominalValue,
                  tolerance: point.toleranceType === 'PLUS_MINUS' ? `+${point.toleranceValuePlus || point.toleranceValue}/-${point.toleranceValueMinus || point.toleranceValue}mm` : `±${point.toleranceValue}mm`,
                  toleranceType: point.toleranceType || 'BILATERAL',
                  toleranceValue: point.toleranceValue || 0,
                  toleranceValuePlus: point.toleranceValuePlus,
                  toleranceValueMinus: point.toleranceValueMinus,
                  measurementMethod: point.measurementMethod || '',
                  equipment: point.equipment || '',
                  notes: point.notes || '',
                  frequency: point.frequency || getFrequencyByCharacteristicType(point.characteristicType || 'FUNCTIONAL')
                };

                // Calculate limits
                const limits = calculateLimits(
                  controlPoint.nominalValue || 0,
                  controlPoint.toleranceType,
                  controlPoint.toleranceValue,
                  controlPoint.toleranceValuePlus,
                  controlPoint.toleranceValueMinus
                );
                
                controlPoint.upperLimit = limits.upper;
                controlPoint.lowerLimit = limits.lower;

                return controlPoint;
              });

              if (selectedPartPlan) {
                const updatedControlPoints = [...controlPoints, ...newControlPoints];
                const updatedPlan = {
                  ...selectedPartPlan,
                  controlPoints: updatedControlPoints,
                  lastModified: new Date().toISOString()
                };

                const updatedPlans = partPlans.map(plan =>
                  plan.id === selectedPartPlan.id ? updatedPlan : plan
                );

                savePartControlPlans(updatedPlans);
                setSelectedPartPlan(updatedPlan);
                setControlPointDialog(false);
                setAddControlPointsBulk([]);
              }
            }} 
            variant="contained"
            disabled={!selectedPartPlan}
          >
            Kontrol Noktalarını Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DimensionalControlSystem; 