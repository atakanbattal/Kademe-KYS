import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Slider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  GetApp as ExportIcon,
  Compare as CompareIcon,
  Straighten as StraightenIcon,
  AccessTime as TimeIcon,
  MonetizationOn as MoneyIcon,
  ShowChart as ChartIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  FlashOn as EnergyIcon,
  Inventory as MaterialIcon,
  Air as GasIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Types and Interfaces
interface MaterialInfo {
  materialType: 'carbon_steel' | 'stainless_steel' | 'aluminum' | 'copper' | 'other';
  thickness: number;
  weldingMethod: 'mig_mag' | 'tig' | 'mma' | 'saw' | 'fcaw' | 'other';
  wireElectrodeType: string;
  wireDiameter: number;
  weldingPosition: 'PA' | 'PB' | 'PC' | 'PD' | 'PE' | 'PF' | 'PG';
  jointType: 'butt' | 'corner' | 'lap' | 't_joint' | 'edge';
  weldLength: number;
  pieceCount: number;
  passCount: number;
}

interface WeldingParameters {
  current: number;
  voltage: number;
  travelSpeed: number; // mm/min
  wireFeedSpeed: number; // m/min
  gasType: 'co2' | 'argon' | 'ar_co2' | 'ar_o2' | 'helium' | 'other';
  gasFlowRate: number; // l/min
  preheatingTemp: number; // °C
  interpassTemp: number; // °C
  shieldingEfficiency: number; // %
  depositionRate: number; // kg/h
  operatingFactor: number; // %
}

interface CostParameters {
  laborRatePerHour: number; // TL/hour
  wireElectrodePricePerKg: number; // TL/kg
  gasPricePerM3: number; // TL/m³
  electricityPricePerKwh: number; // TL/kWh
  machineEnergyConsumption: number; // kW
  preheatingEnergyCost: number; // TL/hour
  wastePercentage: number; // %
  overheadPercentage: number; // %
  qualityControlCost: number; // TL per meter
  auxiliaryMaterialCost: number; // TL per meter
}

interface CalculationResult {
  weldingTime: number; // minutes
  wireElectrodeConsumption: number; // kg
  gasConsumption: number; // m³
  energyConsumption: number; // kWh
  laborCost: number; // TL
  materialCost: number; // TL
  gasCost: number; // TL
  energyCost: number; // TL
  preheatingCost: number; // TL
  wasteCost: number; // TL
  overheadCost: number; // TL
  qualityControlCost: number; // TL
  auxiliaryMaterialCost: number; // TL
  totalCost: number; // TL
  costPerMeter: number; // TL/m
  costPerPiece: number; // TL/piece
}

interface Scenario {
  id: string;
  name: string;
  materialInfo: MaterialInfo;
  weldingParameters: WeldingParameters;
  costParameters: CostParameters;
  result: CalculationResult;
  createdAt: string;
}

// Constants
const MATERIAL_TYPES = [
  { value: 'carbon_steel', label: 'Karbon Çeliği', density: 7.85 },
  { value: 'stainless_steel', label: 'Paslanmaz Çelik', density: 8.0 },
  { value: 'aluminum', label: 'Alüminyum', density: 2.7 },
  { value: 'copper', label: 'Bakır', density: 8.96 },
  { value: 'other', label: 'Diğer', density: 7.8 },
];

const WELDING_METHODS = [
  { value: 'mig_mag', label: 'MIG/MAG', efficiency: 0.85 },
  { value: 'tig', label: 'TIG', efficiency: 0.95 },
  { value: 'mma', label: 'MMA (Elektrod)', efficiency: 0.70 },
  { value: 'saw', label: 'SAW (Alttan Kaynak)', efficiency: 0.90 },
  { value: 'fcaw', label: 'FCAW (Özlü Tel)', efficiency: 0.80 },
  { value: 'other', label: 'Diğer', efficiency: 0.75 },
];

const WELDING_POSITIONS = [
  { value: 'PA', label: 'PA - Düz', multiplier: 1.0 },
  { value: 'PB', label: 'PB - Yatay', multiplier: 1.2 },
  { value: 'PC', label: 'PC - Yatay Dikey', multiplier: 1.4 },
  { value: 'PD', label: 'PD - Overhead', multiplier: 1.8 },
  { value: 'PE', label: 'PE - Overhead Yatay', multiplier: 1.6 },
  { value: 'PF', label: 'PF - Dikey Yukarı', multiplier: 1.5 },
  { value: 'PG', label: 'PG - Dikey Aşağı', multiplier: 1.3 },
];

const JOINT_TYPES = [
  { value: 'butt', label: 'Alın Birleştirme', factor: 1.0 },
  { value: 'corner', label: 'Köşe Birleştirme', factor: 1.2 },
  { value: 'lap', label: 'Bindirme', factor: 0.8 },
  { value: 't_joint', label: 'T Birleştirme', factor: 1.3 },
  { value: 'edge', label: 'Kenar Birleştirme', factor: 0.6 },
];

const GAS_TYPES = [
  { value: 'co2', label: 'CO₂', flowRate: 15, efficiency: 0.85 },
  { value: 'argon', label: 'Argon', flowRate: 12, efficiency: 0.95 },
  { value: 'ar_co2', label: 'Ar + CO₂ (%80-20)', flowRate: 15, efficiency: 0.90 },
  { value: 'ar_o2', label: 'Ar + O₂ (%98-2)', flowRate: 15, efficiency: 0.92 },
  { value: 'helium', label: 'Helyum', flowRate: 20, efficiency: 0.88 },
  { value: 'other', label: 'Diğer Karışım', flowRate: 15, efficiency: 0.85 },
];

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

const CostCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
  border: `1px solid ${theme.palette.primary.main}30`,
  borderRadius: 12,
  height: '100%',
}));

const ResultCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
  border: `1px solid ${theme.palette.success.main}30`,
  borderRadius: 12,
  height: '100%',
}));

// Helper Functions
const calculateWeldingTime = (
  weldLength: number,
  travelSpeed: number,
  pieceCount: number,
  passCount: number,
  operatingFactor: number
): number => {
  const timePerPass = (weldLength / travelSpeed) * pieceCount; // minutes
  const totalTime = timePerPass * passCount;
  return totalTime / (operatingFactor / 100);
};

const calculateWireConsumption = (
  weldLength: number,
  wireDiameter: number,
  depositionRate: number,
  weldingTime: number,
  pieceCount: number,
  jointFactor: number,
  wireFeedSpeed: number
): number => {
  // ✅ YENİ HESAPLAMA: Tel sürme hızı bazlı tel tüketimi hesabı
  // Wire consumption = wire feed speed (m/min) × welding time (min) × wire density
  const wireDensity = 7.85; // kg/m³ (steel wire density)
  const wireArea = Math.PI * Math.pow(wireDiameter / 2000, 2); // mm² to m²
  
  // Tel tüketimi = Tel sürme hızı × Kaynak süresi × Tel yoğunluğu × Tel kesit alanı × Eklem faktörü
  const wireVolumePerMinute = wireFeedSpeed * wireArea; // m³/min
  const totalWireVolume = wireVolumePerMinute * weldingTime * jointFactor; // m³
  const totalWireWeight = totalWireVolume * wireDensity; // kg
  
  // Alternatif olarak deposition rate kontrolü (daha büyük olan kullanılır)
  const depositionBasedConsumption = depositionRate * (weldingTime / 60) * jointFactor;
  
  // İki hesaplama arasından daha büyük olanı al (güvenli taraf)
  return Math.max(totalWireWeight, depositionBasedConsumption);
};

const calculateGasConsumption = (
  weldingTime: number,
  gasFlowRate: number,
  shieldingEfficiency: number
): number => {
  // ✅ DÜZELTME: Gaz tüketimi = (welding time min) * (flow rate L/min) * efficiency / 1000 (L to m³)
  const totalFlowLiters = weldingTime * gasFlowRate * (shieldingEfficiency / 100);
  return totalFlowLiters / 1000; // L to m³ conversion
};

const calculateEnergyConsumption = (
  current: number,
  voltage: number,
  weldingTime: number,
  operatingFactor: number,
  machineEnergyConsumption?: number
): number => {
  // ✅ DÜZELTME: Enerji tüketimi = (welding power kW + machine power kW) * time hours * operating factor
  const weldingPower = (current * voltage) / 1000; // kW (kaynak gücü)
  const totalPower = weldingPower + (machineEnergyConsumption || 0); // kW (toplam güç)
  const totalHours = weldingTime / 60; // minutes to hours
  return totalPower * totalHours * (operatingFactor / 100); // kWh
};

// Main Component
const WeldingCostCalculation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Form States
  const [materialInfo, setMaterialInfo] = useState<MaterialInfo>({
    materialType: 'carbon_steel',
    thickness: 10,
    weldingMethod: 'mig_mag',
    wireElectrodeType: 'ER70S-6',
    wireDiameter: 1.2,
    weldingPosition: 'PA',
    jointType: 'butt',
    weldLength: 1000,
    pieceCount: 1,
    passCount: 1,
  });

  const [weldingParameters, setWeldingParameters] = useState<WeldingParameters>({
    current: 180,
    voltage: 20,
    travelSpeed: 300,
    wireFeedSpeed: 8.5,
    gasType: 'ar_co2',
    gasFlowRate: 15,
    preheatingTemp: 0,
    interpassTemp: 0,
    shieldingEfficiency: 90,
    depositionRate: 2.5,
    operatingFactor: 60,
  });

  const [costParameters, setCostParameters] = useState<CostParameters>({
    laborRatePerHour: 150,
    wireElectrodePricePerKg: 45,
    gasPricePerM3: 12,
    electricityPricePerKwh: 2.5,
    machineEnergyConsumption: 5,
    preheatingEnergyCost: 25,
    wastePercentage: 15,
    overheadPercentage: 25,
    qualityControlCost: 2.5,
    auxiliaryMaterialCost: 1.8,
  });

  // Auto-calculate parameters based on material and method
  useEffect(() => {
    const material = MATERIAL_TYPES.find(m => m.value === materialInfo.materialType);
    const method = WELDING_METHODS.find(m => m.value === materialInfo.weldingMethod);
    const gas = GAS_TYPES.find(g => g.value === weldingParameters.gasType);

    if (material && method && gas) {
      // Auto-suggest parameters based on thickness and method
      let suggestedCurrent = Math.max(100, materialInfo.thickness * 15);
      let suggestedVoltage = Math.max(18, 15 + materialInfo.thickness * 0.3);
      let suggestedSpeed = Math.max(200, 500 - materialInfo.thickness * 10);

      if (materialInfo.weldingMethod === 'tig') {
        suggestedCurrent *= 0.8;
        suggestedSpeed *= 0.6;
      } else if (materialInfo.weldingMethod === 'mma') {
        suggestedCurrent *= 0.9;
        suggestedSpeed *= 0.4;
      }

      setWeldingParameters(prev => ({
        ...prev,
        current: Math.round(suggestedCurrent),
        voltage: Math.round(suggestedVoltage * 10) / 10,
        travelSpeed: Math.round(suggestedSpeed),
        gasFlowRate: gas.flowRate,
        shieldingEfficiency: gas.efficiency * 100,
        depositionRate: method.efficiency * 3,
      }));
    }
  }, [materialInfo.materialType, materialInfo.weldingMethod, materialInfo.thickness, weldingParameters.gasType]);

  // Calculate results
  const calculationResult = useMemo((): CalculationResult => {
    console.log('🔄 Maliyet hesaplaması güncelleniyor...', {
      materialInfo,
      weldingParameters,
      costParameters
    });
    
    const jointType = JOINT_TYPES.find(j => j.value === materialInfo.jointType);
    const position = WELDING_POSITIONS.find(p => p.value === materialInfo.weldingPosition);
    
    const weldingTime = calculateWeldingTime(
      materialInfo.weldLength,
      weldingParameters.travelSpeed,
      materialInfo.pieceCount,
      materialInfo.passCount,
      weldingParameters.operatingFactor
    );

    const wireConsumption = calculateWireConsumption(
      materialInfo.weldLength,
      materialInfo.wireDiameter,
      weldingParameters.depositionRate,
      weldingTime,
      materialInfo.pieceCount,
      jointType?.factor || 1.0,
      weldingParameters.wireFeedSpeed
    );

    const gasConsumption = calculateGasConsumption(
      weldingTime,
      weldingParameters.gasFlowRate,
      weldingParameters.shieldingEfficiency
    );

    const energyConsumption = calculateEnergyConsumption(
      weldingParameters.current,
      weldingParameters.voltage,
      weldingTime,
      weldingParameters.operatingFactor,
      costParameters.machineEnergyConsumption
    );

    // Cost calculations
    const laborCost = (weldingTime / 60) * costParameters.laborRatePerHour * (position?.multiplier || 1.0);
    const materialCost = wireConsumption * costParameters.wireElectrodePricePerKg;
    const gasCost = gasConsumption * costParameters.gasPricePerM3;
    const energyCost = energyConsumption * costParameters.electricityPricePerKwh;
    
    // ✅ DÜZELTME: Ön ısıtma maliyeti (sadece ön ısıtma varsa)
    const preheatingCost = weldingParameters.preheatingTemp > 0 ? 
      (weldingTime / 60) * costParameters.preheatingEnergyCost : 0;
    
    // ✅ YENİ MALIYET MODELİ: Sadece temel kaynak maliyetleri
    const totalCost = laborCost + materialCost + gasCost + energyCost + preheatingCost;
    
    // Gereksiz maliyetler kaldırıldı (kullanıcı girmedi):
    const wasteCost = 0; // Fire maliyeti
    const overheadCost = 0; // Genel gider
    const qualityControlCost = 0; // Kalite kontrol
    const auxiliaryMaterialCost = 0; // Yardımcı malzeme

    const result = {
      weldingTime,
      wireElectrodeConsumption: wireConsumption,
      gasConsumption,
      energyConsumption,
      laborCost,
      materialCost,
      gasCost,
      energyCost,
      preheatingCost,
      wasteCost,
      overheadCost,
      qualityControlCost,
      auxiliaryMaterialCost,
      totalCost,
      costPerMeter: totalCost / (materialInfo.weldLength / 1000),
      costPerPiece: totalCost / materialInfo.pieceCount,
    };
    
    console.log('✅ Yeni hesaplama sonucu:', result);
    return result;
  }, [materialInfo, weldingParameters, costParameters]);



  const saveScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Senaryo ${scenarios.length + 1}`,
      materialInfo: { ...materialInfo },
      weldingParameters: { ...weldingParameters },
      costParameters: { ...costParameters },
      result: { ...calculationResult },
      createdAt: new Date().toLocaleString('tr-TR'),
    };
    setScenarios([...scenarios, newScenario]);
  };

  const exportResults = () => {
    console.log('Exporting results...', calculationResult);
  };

  // ✅ DÜZELTME: Sadece temel kaynak maliyet bileşenleri (kullanıcının girdiği parametreler)
  const costBreakdownData = [
    { name: 'İşçilik', value: calculationResult.laborCost, color: '#2196F3' },
    { name: 'Tel/Elektrod', value: calculationResult.materialCost, color: '#4CAF50' },
    { name: 'Koruyucu Gaz', value: calculationResult.gasCost, color: '#FF9800' },
    { name: 'Elektrik', value: calculationResult.energyCost, color: '#F44336' },
    // Sadece ön ısıtma varsa göster
    ...(weldingParameters.preheatingTemp > 0 ? [{ name: 'Ön Isıtma', value: calculationResult.preheatingCost, color: '#E91E63' }] : []),
  ].filter(item => item.value > 0);

  return (
    <Box sx={{ p: 3 }}>

      {/* Quick Results Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <CostCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <MoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              ₺{calculationResult.totalCost.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Maliyet
            </Typography>
          </CardContent>
        </CostCard>
        
        <CostCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <StraightenIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="info.main">
              ₺{calculationResult.costPerMeter.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Metre Başı Maliyet
            </Typography>
          </CardContent>
        </CostCard>

        <CostCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <TimeIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {calculationResult.weldingTime.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kaynak Süresi (dk)
            </Typography>
          </CardContent>
        </CostCard>

        <CostCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ₺{calculationResult.laborCost.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              İşçilik Maliyeti
            </Typography>
          </CardContent>
        </CostCard>
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<MaterialIcon />} label="Malzeme & Kaynak" />
          <Tab icon={<SettingsIcon />} label="Parametreler" />
          <Tab icon={<MoneyIcon />} label="Maliyet Girdileri" />
          <Tab icon={<ChartIcon />} label="Sonuçlar & Analiz" />
          <Tab icon={<CompareIcon />} label="Senaryo Karşılaştırma" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <MaterialIcon color="primary" />
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Malzeme ve Kaynak Bilgileri</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <FormControl fullWidth>
                <InputLabel>Malzeme Türü</InputLabel>
                <Select 
                  value={materialInfo.materialType}
                  onChange={(e) => setMaterialInfo({...materialInfo, materialType: e.target.value as any})}
                >
                  {MATERIAL_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Malzeme Kalınlığı"
                type="number"
                value={materialInfo.thickness}
                onChange={(e) => setMaterialInfo({...materialInfo, thickness: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><span className="unit-text">mm</span></InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Kaynak Yöntemi</InputLabel>
                <Select 
                  value={materialInfo.weldingMethod}
                  onChange={(e) => setMaterialInfo({...materialInfo, weldingMethod: e.target.value as any})}
                >
                  {WELDING_METHODS.map(method => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Tel/Elektrod Tipi"
                value={materialInfo.wireElectrodeType}
                onChange={(e) => setMaterialInfo({...materialInfo, wireElectrodeType: e.target.value})}
              />

              <TextField
                fullWidth
                label="Tel Çapı"
                type="number"
                value={materialInfo.wireDiameter}
                onChange={(e) => setMaterialInfo({...materialInfo, wireDiameter: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><span className="unit-text">mm</span></InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Kaynak Pozisyonu</InputLabel>
                <Select 
                  value={materialInfo.weldingPosition}
                  onChange={(e) => setMaterialInfo({...materialInfo, weldingPosition: e.target.value as any})}
                >
                  {WELDING_POSITIONS.map(pos => (
                    <MenuItem key={pos.value} value={pos.value}>
                      {pos.label} (x{pos.multiplier})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Birleşim Tipi</InputLabel>
                <Select 
                  value={materialInfo.jointType}
                  onChange={(e) => setMaterialInfo({...materialInfo, jointType: e.target.value as any})}
                >
                  {JOINT_TYPES.map(joint => (
                    <MenuItem key={joint.value} value={joint.value}>
                      {joint.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Kaynak Dikişi Uzunluğu"
                type="number"
                value={materialInfo.weldLength}
                onChange={(e) => setMaterialInfo({...materialInfo, weldLength: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><span className="unit-text">mm</span></InputAdornment>,
                }}
              />

              <TextField
                fullWidth
                label="Parça Adedi"
                type="number"
                value={materialInfo.pieceCount}
                onChange={(e) => setMaterialInfo({...materialInfo, pieceCount: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">adet</InputAdornment>,
                }}
              />

              <TextField
                fullWidth
                label="Paso Sayısı"
                type="number"
                value={materialInfo.passCount}
                onChange={(e) => setMaterialInfo({...materialInfo, passCount: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">paso</InputAdornment>,
                }}
              />
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <SettingsIcon color="primary" />
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Kaynak Parametreleri</Typography>
            <Chip label="Otomatik Öneri" size="small" color="info" />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <TextField
              fullWidth
              label="Kaynak Akımı"
              type="number"
              value={weldingParameters.current}
              onChange={(e) => setWeldingParameters({...weldingParameters, current: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">A</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Kaynak Voltajı"
              type="number"
              value={weldingParameters.voltage}
              onChange={(e) => setWeldingParameters({...weldingParameters, voltage: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">V</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Kaynak Hızı"
              type="number"
              value={weldingParameters.travelSpeed}
              onChange={(e) => setWeldingParameters({...weldingParameters, travelSpeed: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">mm/dk</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Tel Sürme Hızı"
              type="number"
              value={weldingParameters.wireFeedSpeed}
              onChange={(e) => {
                const newSpeed = Number(e.target.value);
                console.log('🔧 Tel sürme hızı değişti:', newSpeed);
                setWeldingParameters({...weldingParameters, wireFeedSpeed: newSpeed});
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">m/dk</InputAdornment>,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Koruyucu Gaz Tipi</InputLabel>
              <Select 
                value={weldingParameters.gasType}
                onChange={(e) => setWeldingParameters({...weldingParameters, gasType: e.target.value as any})}
              >
                {GAS_TYPES.map(gas => (
                  <MenuItem key={gas.value} value={gas.value}>
                    {gas.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Gaz Debisi"
              type="number"
              value={weldingParameters.gasFlowRate}
              onChange={(e) => setWeldingParameters({...weldingParameters, gasFlowRate: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">l/dk</InputAdornment>,
              }}
            />

            <Box>
              <Typography gutterBottom>Koruyucu Gaz Etkinliği (%)</Typography>
              <Slider
                value={weldingParameters.shieldingEfficiency}
                onChange={(e, value) => setWeldingParameters({...weldingParameters, shieldingEfficiency: value as number})}
                min={50}
                max={100}
                step={5}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>

            <TextField
              fullWidth
              label="Birikim Oranı"
              type="number"
              value={weldingParameters.depositionRate}
              onChange={(e) => setWeldingParameters({...weldingParameters, depositionRate: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">kg/h</InputAdornment>,
              }}
            />

            <Box>
              <Typography gutterBottom>Çalışma Faktörü (%)</Typography>
              <Slider
                value={weldingParameters.operatingFactor}
                onChange={(e, value) => setWeldingParameters({...weldingParameters, operatingFactor: value as number})}
                min={30}
                max={90}
                step={5}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
          </Box>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <MoneyIcon color="primary" />
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Maliyet Parametreleri</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <TextField
              fullWidth
              label="Kaynakçı Saatlik Ücreti"
              type="number"
              value={costParameters.laborRatePerHour}
              onChange={(e) => setCostParameters({...costParameters, laborRatePerHour: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">₺/saat</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Tel/Elektrod Birim Fiyatı"
              type="number"
              value={costParameters.wireElectrodePricePerKg}
              onChange={(e) => {
                const newPrice = Number(e.target.value);
                console.log('💰 Tel fiyatı değişti:', newPrice);
                setCostParameters({...costParameters, wireElectrodePricePerKg: newPrice});
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">₺/kg</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Koruyucu Gaz Birim Fiyatı"
              type="number"
              value={costParameters.gasPricePerM3}
              onChange={(e) => setCostParameters({...costParameters, gasPricePerM3: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">₺/m³</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Elektrik Birim Fiyatı"
              type="number"
              value={costParameters.electricityPricePerKwh}
              onChange={(e) => setCostParameters({...costParameters, electricityPricePerKwh: Number(e.target.value)})}
              InputProps={{
                endAdornment: <InputAdornment position="end">₺/kWh</InputAdornment>,
              }}
            />

            {/* Ön ısıtma maliyeti sadece ön ısıtma varsa */}
            {weldingParameters.preheatingTemp > 0 && (
              <TextField
                fullWidth
                label="Ön Isıtma Enerji Maliyeti"
                type="number"
                value={costParameters.preheatingEnergyCost}
                onChange={(e) => setCostParameters({...costParameters, preheatingEnergyCost: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₺/saat</InputAdornment>,
                }}
                helperText={`Ön ısıtma sıcaklığı: ${weldingParameters.preheatingTemp}°C`}
              />
            )}
          </Box>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <ChartIcon color="primary" />
            <Typography variant="h6">Hesaplama Sonuçları ve Analiz</Typography>
          </Box>
          {/* Chart and Technical Data */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, mb: 3 }}>
            <ResultCard>
              <CardHeader title="Maliyet Dağılımı" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(1)}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value: any) => [`₺${value.toFixed(2)}`, 'Maliyet']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </ResultCard>

            <ResultCard>
              <CardHeader title="Teknik Hesaplamalar" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon><TimeIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Kaynak Süresi" 
                      secondary={`${calculationResult.weldingTime.toFixed(1)} dakika`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><MaterialIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Tel Sarfiyatı" 
                      secondary={`${calculationResult.wireElectrodeConsumption.toFixed(3)} kg`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><GasIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Gaz Tüketimi" 
                      secondary={`${calculationResult.gasConsumption.toFixed(3)} m³`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><EnergyIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Enerji Tüketimi" 
                      secondary={`${calculationResult.energyConsumption.toFixed(2)} kWh`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </ResultCard>
          </Box>

          {/* Cost Breakdown Table */}
          <ResultCard>
            <CardHeader title="Detaylı Maliyet Analizi" />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Maliyet Kalemi</TableCell>
                      <TableCell align="right">Miktar</TableCell>
                      <TableCell align="right">Birim Fiyat</TableCell>
                      <TableCell align="right">Toplam (₺)</TableCell>
                      <TableCell align="right">Oran (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>İşçilik</TableCell>
                      <TableCell align="right">{(calculationResult.weldingTime / 60).toFixed(2)} saat</TableCell>
                      <TableCell align="right">₺{costParameters.laborRatePerHour}</TableCell>
                      <TableCell align="right">₺{calculationResult.laborCost.toFixed(2)}</TableCell>
                      <TableCell align="right">{((calculationResult.laborCost / calculationResult.totalCost) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sarf Malzeme</TableCell>
                      <TableCell align="right">{calculationResult.wireElectrodeConsumption.toFixed(3)} kg</TableCell>
                      <TableCell align="right">₺{costParameters.wireElectrodePricePerKg}</TableCell>
                      <TableCell align="right">₺{calculationResult.materialCost.toFixed(2)}</TableCell>
                      <TableCell align="right">{((calculationResult.materialCost / calculationResult.totalCost) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Koruyucu Gaz</TableCell>
                      <TableCell align="right">{calculationResult.gasConsumption.toFixed(3)} m³</TableCell>
                      <TableCell align="right">₺{costParameters.gasPricePerM3}</TableCell>
                      <TableCell align="right">₺{calculationResult.gasCost.toFixed(2)}</TableCell>
                      <TableCell align="right">{((calculationResult.gasCost / calculationResult.totalCost) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Enerji</TableCell>
                      <TableCell align="right">{calculationResult.energyConsumption.toFixed(2)} kWh</TableCell>
                      <TableCell align="right">₺{costParameters.electricityPricePerKwh}</TableCell>
                      <TableCell align="right">₺{calculationResult.energyCost.toFixed(2)}</TableCell>
                      <TableCell align="right">{((calculationResult.energyCost / calculationResult.totalCost) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    {weldingParameters.preheatingTemp > 0 && (
                      <TableRow>
                        <TableCell>Ön Isıtma ({weldingParameters.preheatingTemp}°C)</TableCell>
                        <TableCell align="right">{(calculationResult.weldingTime / 60).toFixed(2)} saat</TableCell>
                        <TableCell align="right">₺{costParameters.preheatingEnergyCost}</TableCell>
                        <TableCell align="right">₺{calculationResult.preheatingCost.toFixed(2)}</TableCell>
                        <TableCell align="right">{((calculationResult.preheatingCost / calculationResult.totalCost) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                      <TableCell><strong>TOPLAM</strong></TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right"><strong>₺{calculationResult.totalCost.toFixed(2)}</strong></TableCell>
                      <TableCell align="right"><strong>100%</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </ResultCard>
        </Paper>
      )}

      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CompareIcon color="primary" />
            <Typography variant="h6">Senaryo Karşılaştırma</Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Farklı senaryoları karşılaştırmak için önce senaryolarınızı kaydedin.
          </Alert>
          
          {scenarios.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              {scenarios.map((scenario) => (
                <Card key={scenario.id}>
                  <CardHeader 
                    title={scenario.name}
                    action={
                      <IconButton>
                        <CompareIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      ₺{scenario.result.totalCost.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {scenario.createdAt}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block">
                        {scenario.materialInfo.weldingMethod.toUpperCase()} - {scenario.materialInfo.thickness}mm
                      </Typography>
                      <Typography variant="caption" display="block">
                        {scenario.materialInfo.weldLength}mm x {scenario.materialInfo.pieceCount} adet
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Henüz kaydedilmiş senaryo bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Senaryolarınızı kaydetmek için "Senaryo Kaydet" butonunu kullanın.
              </Typography>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={saveScenario}>
                İlk Senaryoyu Kaydet
              </Button>
            </Paper>
          )}
        </Paper>
      )}

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Kaynak Maliyet Hesaplama Yardımı</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Hesaplama Formülleri:</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Tel/Elektrod Sarfiyatı:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
              Sarfiyat = (Birikim Oranı / 60) × (Kaynak Süresi / Dikiş Uzunluğu) × Dikiş Uzunluğu × Parça Adedi × Birleştirme Faktörü
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Gaz Tüketimi:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
              Gaz Tüketimi = (Kaynak Süresi × Gaz Debisi × Koruyucu Gaz Etkinliği) / 1000
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Enerji Tüketimi:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
              Enerji = (Amper × Volt × Süre × Çalışma Faktörü) / 1000
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Kullanım Rehberi:</Typography>
          <Typography variant="body2" paragraph>
            1. <strong>Malzeme Bilgileri:</strong> Kaynak edilecek malzeme türü, kalınlık ve kaynak yöntemi seçin.
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>Parametreler:</strong> Otomatik öneri değerleri kontrol edin ve gerekirse düzenleyin.
          </Typography>
          <Typography variant="body2" paragraph>
            3. <strong>Maliyet Girdileri:</strong> Güncel birim fiyatları girin.
          </Typography>
          <Typography variant="body2" paragraph>
            4. <strong>Sonuçlar:</strong> Detaylı maliyet analizi ve grafikleri inceleyin.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeldingCostCalculation; 