import React, { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  TextField,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Construction as ConstructionIcon,
  FilterList as FilterListIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';

// Modern Types
interface WeldData {
  materialThickness: number;
  weldType: string;
  weldWidth: number;
  weldHeight?: number;
  defectCode: string;
  defectType: string;
  qualityLevel: string;
  dynamicParameters: { [key: string]: any };
  nominalThroatThickness?: number;
  actualThroatThickness?: number;
  legLength1?: number;
  legLength2?: number;
}

interface ModernCalculationResult {
  defectInfo: {
    code: string;
    name: string;
    description: string;
    category: string;
  };
  weldDetails?: {
    materialThickness: number;
    weldType: string;
    qualityLevel: string;
  };
  parameters: { [key: string]: any };
  calculation: {
    allowed: boolean;
    result: string;
    reason: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    [key: string]: any;
  };
  qualityLevel: string;
  standard: string;
  calculatedAt: string;
  timestamp?: string;
}

// Weld Types
const WELD_TYPES = [
  { value: 'butt', label: 'Alın Birleştirme', description: 'İki parçanın uç uca kaynaklanması' },
  { value: 'fillet', label: 'Köşe Birleştirme', description: 'L şeklinde birleştirme' },
  { value: 'edge', label: 'Kenar Birleştirme', description: 'Kenarların birleştirilmesi' },
  { value: 't-joint', label: 'T-Kaynağı', description: 'T şeklinde birleştirme' },
  { value: 'corner', label: 'Köşe Kaynağı', description: 'Köşe birleştirmesi' },
  { value: 'lap', label: 'Bindirme Kaynağı', description: 'Üst üste bindirme' },
];

// Defect Types
const DEFECT_TYPES = [
  {
    code: '100',
    name: 'Çatlak',
    description: 'Kaynak metalinde veya ana metalde oluşan çatlaklar',
    category: 'critical',
    appliesTo: ['butt', 'fillet', 'edge', 't-joint', 'corner', 'lap'],
    parameters: ['length', 'depth'],
    calculation: 'crack_based'
  },
  {
    code: '2011',
    name: 'Kaynak Çökük (Undercut)',
    description: 'Kaynak kenarında oluşan oyuklar',
    category: 'dimensional',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'undercut_based'
  },
  {
    code: '2012',
    name: 'Aşırı Derinlik',
    description: 'Kaynak penetrasyonunun fazla olması',
    category: 'dimensional',
    appliesTo: ['butt'],
    parameters: ['thickness', 'penetration'],
    calculation: 'penetration_based'
  },
  {
    code: '2013',
    name: 'Yetersiz Nüfuziyet',
    description: 'Kaynak kökünde eksik nüfuziyet',
    category: 'dimensional',
    appliesTo: ['butt', 't-joint'],
    parameters: ['thickness', 'rootPenetration'],
    calculation: 'penetration_based'
  },
  {
    code: '2014',
    name: 'Aşırı Taşma',
    description: 'Kaynak metalinin aşırı taşması',
    category: 'dimensional',
    appliesTo: ['butt', 'fillet'],
    parameters: ['width', 'height'],
    calculation: 'overflow_based'
  },
  {
    code: '2015',
    name: 'Yetersiz Kaynak Kalınlığı',
    description: 'Köşe kaynakta yetersiz boğaz kalınlığı',
    category: 'dimensional',
    appliesTo: ['fillet'],
    parameters: ['nominalThickness', 'actualThickness'],
    calculation: 'throat_thickness'
  },
  {
    code: '2017',
    name: 'Düzensiz Kaynak Yüzeyi',
    description: 'Kaynak yüzeyinin düzensizliği',
    category: 'surface',
    appliesTo: ['butt', 'fillet'],
    parameters: ['roughness'],
    calculation: 'surface_roughness'
  },
  {
    code: '2024',
    name: 'Gözenek',
    description: 'Kaynak metalinde gaz boşlukları',
    category: 'internal',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['diameter', 'density'],
    calculation: 'porosity_based'
  },
  {
    code: '2025',
    name: 'Cüruf Kalıntısı',
    description: 'Kaynak metalinde cüruf artıkları',
    category: 'internal',
    appliesTo: ['butt', 'fillet'],
    parameters: ['length', 'width'],
    calculation: 'inclusion_based'
  }
];

// Parameter Definitions
const PARAMETER_DEFINITIONS: { [key: string]: any } = {
  length: { label: 'Uzunluk', unit: 'mm', type: 'number', min: 0, max: 1000 },
  depth: { label: 'Derinlik', unit: 'mm', type: 'number', min: 0, max: 50 },
  thickness: { label: 'Malzeme Kalınlığı', unit: 'mm', type: 'number', min: 0, max: 100 },
  width: { label: 'Genişlik', unit: 'mm', type: 'number', min: 0, max: 100 },
  height: { label: 'Yükseklik', unit: 'mm', type: 'number', min: 0, max: 50 },
  penetration: { label: 'Penetrasyon', unit: 'mm', type: 'number', min: 0, max: 50 },
  rootPenetration: { label: 'Kök Penetrasyonu', unit: 'mm', type: 'number', min: 0, max: 20 },
  nominalThickness: { label: 'Nominal Kalınlık', unit: 'mm', type: 'number', min: 0, max: 50 },
  actualThickness: { label: 'Fiili Kalınlık', unit: 'mm', type: 'number', min: 0, max: 50 },
  diameter: { label: 'Çap', unit: 'mm', type: 'number', min: 0, max: 20 },
  density: { label: 'Yoğunluk', unit: 'adet/cm²', type: 'number', min: 0, max: 100 },
  roughness: { label: 'Pürüzlülük', unit: 'μm', type: 'number', min: 0, max: 1000 }
};

// Calculation Engine
const CALCULATION_ENGINE: { [key: string]: (params: any, qualityLevel: string) => any } = {
  crack_based: (params, level) => ({
    allowed: false,
    result: 'Çatlak müsaade edilmez',
    reason: 'ISO 5817 standardına göre hiçbir kalite seviyesinde çatlak kabul edilmez'
  }),
  
  undercut_based: (params, level) => {
    const { thickness, depth } = params;
    const limits = { B: 0.05 * thickness, C: 0.1 * thickness, D: 0.2 * thickness };
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Undercut kabul edilebilir (${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : `Undercut kabul edilemez (${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum undercut derinliği: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  penetration_based: (params, level) => {
    const { thickness, penetration } = params;
    const minRequired = thickness * 0.7; // Minimum %70 penetrasyon
    const allowed = penetration >= minRequired;
    
    return {
      allowed,
      result: allowed ? `Penetrasyon yeterli (${penetration}mm ≥ ${minRequired.toFixed(2)}mm)` : `Penetrasyon yetersiz (${penetration}mm < ${minRequired.toFixed(2)}mm)`,
      reason: `Minimum gerekli penetrasyon: malzeme kalınlığının %70'i (${minRequired.toFixed(2)}mm)`
    };
  },
  
  overflow_based: (params, level) => {
    const { width, height } = params;
    const limits = { B: 1, C: 2, D: 3 };
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Taşma kabul edilebilir (${height}mm ≤ ${maxLimit}mm)` : `Taşma kabul edilemez (${height}mm > ${maxLimit}mm)`,
      reason: `${level} kalite seviyesi için maksimum taşma yüksekliği: ${maxLimit}mm`
    };
  },
  
  throat_thickness: (params, level) => {
    const { nominalThickness, actualThickness } = params;
    const minRequired = nominalThickness * 0.9; // Minimum %90 nominal değer
    const allowed = actualThickness >= minRequired;
    
    return {
      allowed,
      result: allowed ? `Boğaz kalınlığı yeterli (${actualThickness}mm ≥ ${minRequired.toFixed(2)}mm)` : `Boğaz kalınlığı yetersiz (${actualThickness}mm < ${minRequired.toFixed(2)}mm)`,
      reason: `Minimum gerekli boğaz kalınlığı: nominal değerin %90'ı (${minRequired.toFixed(2)}mm)`
    };
  },
  
  surface_roughness: (params, level) => {
    const { roughness } = params;
    const limits = { B: 40, C: 80, D: 160 }; // μm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = roughness <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Yüzey pürüzlülüğü kabul edilebilir (${roughness}μm ≤ ${maxLimit}μm)` : `Yüzey pürüzlülüğü kabul edilemez (${roughness}μm > ${maxLimit}μm)`,
      reason: `${level} kalite seviyesi için maksimum pürüzlülük: ${maxLimit}μm`
    };
  },
  
  porosity_based: (params, level) => {
    const { diameter, density } = params;
    const maxDiameter = { B: 1, C: 2, D: 3 };
    const maxDensity = { B: 1, C: 2, D: 4 };
    const diameterLimit = maxDiameter[level as keyof typeof maxDiameter] || 0;
    const densityLimit = maxDensity[level as keyof typeof maxDensity] || 0;
    
    const allowed = diameter <= diameterLimit && density <= densityLimit;
    
    return {
      allowed,
      result: allowed ? `Gözenek kabul edilebilir` : `Gözenek kabul edilemez`,
      reason: `${level} kalite seviyesi için maks çap: ${diameterLimit}mm, maks yoğunluk: ${densityLimit} adet/cm²`
    };
  },
  
  inclusion_based: (params, level) => {
    const { length, width } = params;
    const area = length * width;
    const limits = { B: 5, C: 10, D: 20 }; // mm²
    const maxArea = limits[level as keyof typeof limits] || 0;
    const allowed = area <= maxArea;
    
    return {
      allowed,
      result: allowed ? `Cüruf kalıntısı kabul edilebilir (${area.toFixed(2)}mm² ≤ ${maxArea}mm²)` : `Cüruf kalıntısı kabul edilemez (${area.toFixed(2)}mm² > ${maxArea}mm²)`,
      reason: `${level} kalite seviyesi için maksimum cüruf alanı: ${maxArea}mm²`
    };
  }
};

const ISO5817WeldLimit: React.FC = () => {
  // Modern State Management
  const [modernWizardOpen, setModernWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWeldType, setSelectedWeldType] = useState('');
  const [selectedDefect, setSelectedDefect] = useState<any>(null);
  const [wizardParameters, setWizardParameters] = useState<{ [key: string]: any }>({});
  const [wizardResult, setWizardResult] = useState<ModernCalculationResult | null>(null);

  // Filtered defects based on selected weld type
  const availableDefects = useMemo(() => {
    if (!selectedWeldType) return [];
    return DEFECT_TYPES.filter(defect => 
      defect.appliesTo.includes(selectedWeldType)
    );
  }, [selectedWeldType]);

  // Wizard Steps
  const wizardSteps = ['Kaynak Tipi', 'Hata Seçimi', 'Parametreler', 'Sonuç'];

  // Modern Wizard Functions
  const openModernWizard = () => {
    setModernWizardOpen(true);
    setCurrentStep(0);
    setSelectedWeldType('');
    setSelectedDefect(null);
    setWizardParameters({});
    setWizardResult(null);
  };

  const closeModernWizard = () => {
    setModernWizardOpen(false);
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateModernResult = () => {
    if (!selectedDefect) return;
    
    const calculationEngine = CALCULATION_ENGINE[selectedDefect.calculation];
    if (!calculationEngine) return;

    const calculationResult = calculationEngine(wizardParameters, 'C');
    
    const modernResult: ModernCalculationResult = {
      calculation: calculationResult,
      defectInfo: {
        code: selectedDefect.code,
        name: selectedDefect.name,
        category: selectedDefect.category,
        description: selectedDefect.description
      },
      parameters: wizardParameters,
      qualityLevel: 'C',
      standard: 'ISO 5817',
      calculatedAt: new Date().toISOString()
    };
    
    setWizardResult(modernResult);
    setCurrentStep(3); // Go to results step
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default'
    }}>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            gutterBottom 
            sx={{ 
              color: 'primary.main',
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ISO 5817 Kaynak Limit Değerlendirmesi
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Adım adım rehberlik ile kaynak kalitesi değerlendirmesi yapın. 
            Önce kaynak tipini seçin, ardından hatayı belirleyin ve gerekli parametreleri girin.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<EngineeringIcon />}
            onClick={openModernWizard}
            sx={{
              py: 3,
              px: 6,
              borderRadius: '16px',
              fontSize: '1.2rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              textTransform: 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
              }
            }}
          >
            Hesaplama Başlat
          </Button>
        </Box>

        {/* Features */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <ConstructionIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Kaynak Tipi Seçimi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alın, köşe, kenar ve diğer kaynak tiplerinden uygun olanı seçin
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <FilterListIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Hata Filtreleme
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seçilen kaynak tipine uygun hatalar otomatik olarak listelenir
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CalculateIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Dinamik Parametreler
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seçilen hataya özel parametreler dinamik olarak gösterilir
              </Typography>
            </Card>
          </Grid>
        </Grid>

      </Container>

      {/* Modern Wizard Modal */}
      <Dialog
        open={modernWizardOpen}
        onClose={closeModernWizard}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
            color: 'white',
            fontWeight: 600,
            py: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EngineeringIcon sx={{ fontSize: '2rem' }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                ISO 5817 Modern Hesaplama Sihirbazı
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Adım adım kaynak kalitesi değerlendirmesi
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {/* Stepper */}
          <Box sx={{ px: 4, py: 3, bgcolor: '#f8f9fa' }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {wizardSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: currentStep === index ? 600 : 400,
                        fontSize: '0.9rem'
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step Content */}
          <Box sx={{ p: 4, minHeight: '400px' }}>
            {/* Step 1: Weld Type Selection */}
            {currentStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                  Kaynak Tipini Seçin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Değerlendirmek istediğiniz kaynak tipini aşağıdan seçin. Seçtiğiniz kaynak tipine göre uygun hatalar listelenecektir.
                </Typography>
                
                <Grid container spacing={2}>
                  {WELD_TYPES.map((weldType) => (
                    <Grid item xs={12} sm={6} md={4} key={weldType.value}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedWeldType === weldType.value ? '2px solid' : '1px solid',
                          borderColor: selectedWeldType === weldType.value ? 'primary.main' : 'divider',
                          bgcolor: selectedWeldType === weldType.value ? 'primary.50' : 'background.paper',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => setSelectedWeldType(weldType.value)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Avatar
                            sx={{
                              bgcolor: selectedWeldType === weldType.value ? 'primary.main' : 'grey.300',
                              color: 'white',
                              width: 56,
                              height: 56,
                              mx: 'auto',
                              mb: 2,
                              fontSize: '1.5rem',
                              fontWeight: 600
                            }}
                          >
                            {weldType.value.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {weldType.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {weldType.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Step 2: Defect Selection */}
            {currentStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Hata Türünü Seçin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>{WELD_TYPES.find(w => w.value === selectedWeldType)?.label}</strong> kaynak tipi için uygun hata türlerini görmektesiniz.
                </Typography>

                {availableDefects.length > 0 ? (
                  <Grid container spacing={2}>
                    {availableDefects.map((defect) => (
                      <Grid item xs={12} md={6} key={defect.code}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: selectedDefect?.code === defect.code ? '2px solid' : '1px solid',
                            borderColor: selectedDefect?.code === defect.code ? 'primary.main' : 'divider',
                            bgcolor: selectedDefect?.code === defect.code ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                          onClick={() => setSelectedDefect(defect)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <Chip 
                                label={defect.code} 
                                size="small" 
                                color="primary" 
                                variant={selectedDefect?.code === defect.code ? "filled" : "outlined"}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                  {defect.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {defect.description}
                                </Typography>
                                <Chip 
                                  label={defect.category} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="warning">
                    Bu kaynak tipi için henüz hata tanımı bulunmamaktadır.
                  </Alert>
                )}
              </Box>
            )}

            {/* Step 3: Parameter Input */}
            {currentStep === 2 && selectedDefect && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Parametreleri Girin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>{selectedDefect.name}</strong> hatası için gerekli parametreleri girin.
                </Typography>

                <Grid container spacing={3}>
                  {selectedDefect.parameters?.map((paramName: string) => {
                    const paramDef = PARAMETER_DEFINITIONS[paramName];
                    if (!paramDef) return null;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={paramName}>
                        <TextField
                          fullWidth
                          label={`${paramDef.label} (${paramDef.unit})`}
                          type={paramDef.type}
                          value={wizardParameters[paramName] || ''}
                          onChange={(e) => {
                            const value = paramDef.type === 'number' ? Number(e.target.value) : e.target.value;
                            setWizardParameters(prev => ({
                              ...prev,
                              [paramName]: value
                            }));
                          }}
                          inputProps={paramDef.type === 'number' ? {
                            min: paramDef.min,
                            max: paramDef.max,
                            step: 0.1
                          } : {}}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* Step 4: Results */}
            {currentStep === 3 && wizardResult && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                  Hesaplama Sonuçları
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Hata Bilgileri
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography><strong>Kod:</strong> {wizardResult.defectInfo.code}</Typography>
                          <Typography><strong>Adı:</strong> {wizardResult.defectInfo.name}</Typography>
                          <Typography><strong>Kategori:</strong> {wizardResult.defectInfo.category}</Typography>
                          <Typography><strong>Açıklama:</strong> {wizardResult.defectInfo.description}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Hesaplama Sonucu
                        </Typography>
                        <Alert 
                          severity={wizardResult.calculation.allowed ? "success" : "error"}
                          sx={{ mb: 2 }}
                        >
                          {wizardResult.calculation.result}
                        </Alert>
                        <Typography variant="body2">
                          <strong>Sebep:</strong> {wizardResult.calculation.reason}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Kullanılan Parametreler
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(wizardResult.parameters).map(([key, value]) => (
                            <Chip 
                              key={key} 
                              label={`${key}: ${value}`} 
                              variant="outlined" 
                              size="small"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
          <Button onClick={closeModernWizard} color="inherit">
            Kapat
          </Button>
          
          {currentStep > 0 && currentStep < 3 && (
            <Button onClick={prevStep} variant="outlined" color="primary">
              Önceki
            </Button>
          )}
          
          {currentStep === 0 && selectedWeldType && (
            <Button onClick={nextStep} variant="contained" color="primary">
              Hataları Listele
            </Button>
          )}
          
          {currentStep === 1 && selectedDefect && (
            <Button onClick={nextStep} variant="contained" color="primary">
              Parametreleri Gir
            </Button>
          )}
          
          {currentStep === 2 && selectedDefect && (
            <Button onClick={calculateModernResult} variant="contained" color="success">
              Hesapla
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              onClick={() => {
                closeModernWizard();
                // Reset for new calculation
                setCurrentStep(0);
                setSelectedWeldType('');
                setSelectedDefect(null);
                setWizardParameters({});
                setWizardResult(null);
              }} 
              variant="contained" 
              color="primary"
            >
              Yeni Hesaplama
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ISO5817WeldLimit;