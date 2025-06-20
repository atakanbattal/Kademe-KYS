import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as CertificateIcon,
  Search as SearchIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Material Standards Database
interface MaterialStandard {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  grade: string;
  standard: string;
  chemicalComposition: {
    element: string;
    minValue: number;
    maxValue: number;
    typical?: number;
  }[];
  mechanicalProperties: {
    property: string;
    minValue: number;
    maxValue: number;
    unit: string;
    testMethod: string;
    typical?: number;
  }[];
  hardnessRequirements: {
    type: string;
    minValue: number;
    maxValue: number;
    testPosition: string;
    typical?: number;
  }[];
}

interface MaterialCategory {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    grades: {
      id: string;
      name: string;
      standards: string[];
    }[];
  }[];
}

// Interfaces
interface ChemicalComposition {
  element: string;
  percentage: number;
  specification: string;
  minValue: number;
  maxValue: number;
  status: 'GEÇTİ' | 'KALDI' | 'UYARI' | 'BEKLEMEDE';
}

interface HardnessValue {
  type: string; // HRC, HRB, HV, etc.
  value: number;
  specification: string;
  minValue: number;
  maxValue: number;
  testPosition: string;
  status: 'GEÇTİ' | 'KALDI' | 'UYARI' | 'BEKLEMEDE';
}

interface MechanicalProperty {
  property: string; // Tensile Strength, Yield Strength, Elongation, etc.
  value: number;
  unit: string;
  specification: string;
  minValue: number;
  maxValue: number;
  testMethod: string;
  status: 'GEÇTİ' | 'KALDI' | 'UYARI' | 'BEKLEMEDE';
}

interface Certificate {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  size: number;
  url: string;
}

interface MaterialRecord {
  id: string;
  materialCode: string;
  materialName: string;
  supplier: string;
  batchNumber: string;
  receivedDate: string;
  quantity: number;
  unit: string;
  standard: string;
  grade: string;
  chemicalComposition: ChemicalComposition[];
  hardnessValues: HardnessValue[];
  mechanicalProperties: MechanicalProperty[];
  certificates: Certificate[];
  overallStatus: 'ONAYLANMIS' | 'REDDEDİLDİ' | 'BEKLEMEDE' | 'ŞARTLI';
  notes: string;
  inspector: string;
  inspectionDate: string;
  traceabilityNumber: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Material Standards Database
const materialCategories: MaterialCategory[] = [
  {
    id: 'steel',
    name: 'Çelik',
    subCategories: [
      {
        id: 'structural_steel',
        name: 'Yapı Çeliği',
        grades: [
          { id: 's235jr', name: 'S235JR', standards: ['DIN EN 10025-2', 'DIN EN 10025-3'] },
          { id: 's235j0', name: 'S235J0', standards: ['DIN EN 10025-2'] },
          { id: 's235j2', name: 'S235J2', standards: ['DIN EN 10025-2'] },
          { id: 's275jr', name: 'S275JR', standards: ['DIN EN 10025-2'] },
          { id: 's275j0', name: 'S275J0', standards: ['DIN EN 10025-2'] },
          { id: 's275j2', name: 'S275J2', standards: ['DIN EN 10025-2'] },
          { id: 's275n', name: 'S275N', standards: ['DIN EN 10025-3'] },
          { id: 's275nl', name: 'S275NL', standards: ['DIN EN 10025-3'] },
          { id: 's355jr', name: 'S355JR', standards: ['DIN EN 10025-2'] },
          { id: 's355j0', name: 'S355J0', standards: ['DIN EN 10025-2'] },
          { id: 's355j2', name: 'S355J2', standards: ['DIN EN 10025-2'] },
          { id: 's355k2', name: 'S355K2', standards: ['DIN EN 10025-2'] },
          { id: 's355n', name: 'S355N', standards: ['DIN EN 10025-3'] },
          { id: 's355nl', name: 'S355NL', standards: ['DIN EN 10025-3'] },
          { id: 's420m', name: 'S420M', standards: ['DIN EN 10025-4'] },
          { id: 's420ml', name: 'S420ML', standards: ['DIN EN 10025-4'] },
          { id: 's460m', name: 'S460M', standards: ['DIN EN 10025-4'] },
          { id: 's460ml', name: 'S460ML', standards: ['DIN EN 10025-4'] },
          { id: 's460n', name: 'S460N', standards: ['DIN EN 10025-3'] },
          { id: 's460nl', name: 'S460NL', standards: ['DIN EN 10025-3'] },
          { id: 's500q', name: 'S500Q', standards: ['DIN EN 10025-6'] },
          { id: 's550q', name: 'S550Q', standards: ['DIN EN 10025-6'] },
          { id: 's620q', name: 'S620Q', standards: ['DIN EN 10025-6'] },
          { id: 's690q', name: 'S690Q', standards: ['DIN EN 10025-6'] },
          { id: 's690ql', name: 'S690QL', standards: ['DIN EN 10025-6'] },
          { id: 's890q', name: 'S890Q', standards: ['DIN EN 10025-6'] },
          { id: 's890ql', name: 'S890QL', standards: ['DIN EN 10025-6'] },
          { id: 's960q', name: 'S960Q', standards: ['DIN EN 10025-6'] },
          { id: 's960ql', name: 'S960QL', standards: ['DIN EN 10025-6'] },
          { id: 's1100q', name: 'S1100Q', standards: ['DIN EN 10025-6'] },
          { id: 's1100ql', name: 'S1100QL', standards: ['DIN EN 10025-6'] }
        ]
      },
      {
        id: 'alloy_steel',
        name: 'Alaşımlı Çelik',
        grades: [
          { id: '16mncr5', name: '16MnCr5', standards: ['DIN EN 10084'] },
          { id: '18crmo4', name: '18CrMo4', standards: ['DIN EN 10028-2'] },
          { id: '18crnimo7-6', name: '18CrNiMo7-6', standards: ['DIN EN 10084'] },
          { id: '20mncr5', name: '20MnCr5', standards: ['DIN EN 10084'] },
          { id: '20mova5', name: '20MoV5', standards: ['DIN EN 10028-2'] },
          { id: '25crmo4', name: '25CrMo4', standards: ['DIN EN 10083-3'] },
          { id: '30crmo4', name: '30CrMo4', standards: ['DIN EN 10083-3'] },
          { id: '30crmov9', name: '30CrMoV9', standards: ['DIN EN 10028-2'] },
          { id: '34cr4', name: '34Cr4', standards: ['DIN EN 10083-3'] },
          { id: '34crmo4', name: '34CrMo4', standards: ['DIN EN 10083-3'] },
          { id: '34crnimo6', name: '34CrNiMo6', standards: ['DIN EN 10083-3'] },
          { id: '36crnimo4', name: '36CrNiMo4', standards: ['DIN EN 10083-3'] },
          { id: '39crmov13-9', name: '39CrMoV13-9', standards: ['DIN EN 10028-2'] },
          { id: '41cr4', name: '41Cr4', standards: ['DIN EN 10083-3'] },
          { id: '42crmo4', name: '42CrMo4', standards: ['DIN EN 10083-3', 'AISI 4140'] },
          { id: '42crmov4-7', name: '42CrMoV4-7', standards: ['DIN EN 10028-2'] },
          { id: '50crmo4', name: '50CrMo4', standards: ['DIN EN 10083-3'] },
          { id: '51crv4', name: '51CrV4', standards: ['DIN EN 10089'] },
          { id: '10crmo9-10', name: '10CrMo9-10', standards: ['DIN EN 10028-2'] },
          { id: '11crmo9-10', name: '11CrMo9-10', standards: ['DIN EN 10028-2'] },
          { id: '13crmo4-5', name: '13CrMo4-5', standards: ['DIN EN 10028-2'] },
          { id: '14mov6-3', name: '14MoV6-3', standards: ['DIN EN 10028-2'] },
          { id: '15mo3', name: '15Mo3', standards: ['DIN EN 10028-2'] }
        ]
      },
      {
        id: 'tool_steel',
        name: 'Takım Çeliği',
        grades: [
          { id: '1.2080', name: '1.2080 (D3)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2210', name: '1.2210 (115CrV3)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2241', name: '1.2241 (L6)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2312', name: '1.2312 (P20)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2316', name: '1.2316 (X38CrMo16)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2343', name: '1.2343 (H11)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2344', name: '1.2344 (H13)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2365', name: '1.2365 (X32CrMoV3-3)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2367', name: '1.2367 (X38CrMoV5-3)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2379', name: '1.2379 (D2)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2436', name: '1.2436 (X210CrW12)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2510', name: '1.2510 (O1)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2550', name: '1.2550 (60WCrV8)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2601', name: '1.2601 (X165CrV12)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2709', name: '1.2709 (X3NiCoMoTi18-9-5)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2714', name: '1.2714 (X24NiCrMo17)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2738', name: '1.2738 (X45NiCrMo4)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2767', name: '1.2767 (45NiCrMo16)', standards: ['DIN EN ISO 4957'] },
          { id: '1.2842', name: '1.2842 (90MnV8)', standards: ['DIN EN ISO 4957'] },
          { id: '1.3343', name: '1.3343 (HSS M2)', standards: ['DIN EN ISO 4957'] },
          { id: '1.3207', name: '1.3207 (90MnCrV8)', standards: ['DIN EN ISO 4957'] }
        ]
      },
      {
        id: 'spring_steel',
        name: 'Yay Çeliği',
        grades: [
          { id: '38si7', name: '38Si7', standards: ['DIN EN 10089'] },
          { id: '46si7', name: '46Si7', standards: ['DIN EN 10089'] },
          { id: '50crmo4', name: '50CrMo4', standards: ['DIN EN 10089'] },
          { id: '50crv4', name: '50CrV4', standards: ['DIN EN 10089'] },
          { id: '51crv4', name: '51CrV4', standards: ['DIN EN 10089'] },
          { id: '54sicr6', name: '54SiCr6', standards: ['DIN EN 10089'] },
          { id: '55cr3', name: '55Cr3', standards: ['DIN EN 10089'] },
          { id: '60si7', name: '60Si7', standards: ['DIN EN 10089'] },
          { id: '60sicr7', name: '60SiCr7', standards: ['DIN EN 10089'] },
          { id: '65si7', name: '65Si7', standards: ['DIN EN 10089'] },
          { id: '67sicr5', name: '67SiCr5', standards: ['DIN EN 10089'] },
          { id: '70si7', name: '70Si7', standards: ['DIN EN 10089'] }
        ]
      },
      {
        id: 'bearing_steel',
        name: 'Rulman Çeliği',
        grades: [
          { id: '100cr6', name: '100Cr6', standards: ['DIN EN ISO 683-17'] },
          { id: '100crmo7-3', name: '100CrMo7-3', standards: ['DIN EN ISO 683-17'] },
          { id: '100crmn6', name: '100CrMn6', standards: ['DIN EN ISO 683-17'] },
          { id: '102cr6', name: '102Cr6', standards: ['DIN EN ISO 683-17'] },
          { id: '105wc7', name: '105WC7', standards: ['DIN EN ISO 683-17'] }
        ]
      }
    ]
  },
  {
    id: 'stainless',
    name: 'Paslanmaz Çelik',
    subCategories: [
              {
          id: 'austenitic',
          name: 'Östenitik',
          grades: [
            { id: '201', name: '201 (X12CrMnNi17-7-5)', standards: ['DIN EN 10088-2'] },
            { id: '202', name: '202 (X12CrMnNi18-9-5)', standards: ['DIN EN 10088-2'] },
            { id: '301', name: '301 (X10CrNi18-8)', standards: ['DIN EN 10088-2'] },
            { id: '302', name: '302 (X12CrNi18-8)', standards: ['ASTM A240'] },
            { id: '303', name: '303 (X8CrNiS18-9)', standards: ['DIN EN 10088-2'] },
            { id: '304', name: '304 (X5CrNi18-10)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '304l', name: '304L (X2CrNi19-11)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '304h', name: '304H (X6CrNi18-10)', standards: ['ASTM A240'] },
            { id: '309', name: '309 (X15CrNi25-20)', standards: ['DIN EN 10088-2'] },
            { id: '310', name: '310 (X15CrNi25-21)', standards: ['DIN EN 10088-2'] },
            { id: '316', name: '316 (X5CrNiMo17-12-2)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '316l', name: '316L (X2CrNiMo17-12-2)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '316h', name: '316H (X6CrNiMo17-12-2)', standards: ['ASTM A240'] },
            { id: '316ti', name: '316Ti (X6CrNiMoTi17-12-2)', standards: ['DIN EN 10088-2'] },
            { id: '317', name: '317 (X5CrNiMo17-13-3)', standards: ['DIN EN 10088-2'] },
            { id: '317l', name: '317L (X2CrNiMo18-14-3)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '321', name: '321 (X6CrNiTi18-10)', standards: ['DIN EN 10088-2'] },
            { id: '321h', name: '321H (X8CrNiTi18-10)', standards: ['ASTM A240'] },
            { id: '347', name: '347 (X6CrNiNb18-10)', standards: ['DIN EN 10088-2', 'ASTM A240'] },
            { id: '347h', name: '347H (X8CrNiNb16-13)', standards: ['ASTM A240'] },
            { id: '904l', name: '904L (X1NiCrMoCu25-20-5)', standards: ['DIN EN 10088-2'] },
            { id: '254smo', name: '254SMO (X1CrNiMoCuN20-18-7)', standards: ['ASTM A240'] }
          ]
        },
              {
          id: 'martensitic',
          name: 'Martensitik',
          grades: [
            { id: '403', name: '403 (X6Cr13)', standards: ['DIN EN 10088-2'] },
            { id: '410', name: '410 (X12Cr13)', standards: ['DIN EN 10088-2'] },
            { id: '416', name: '416 (X12CrS13)', standards: ['DIN EN 10088-2'] },
            { id: '420', name: '420 (X20Cr13)', standards: ['DIN EN 10088-2'] },
            { id: '431', name: '431 (X17CrNi16-2)', standards: ['DIN EN 10088-2'] },
            { id: '440a', name: '440A (X65Cr13)', standards: ['DIN EN 10088-2'] },
            { id: '440b', name: '440B (X85Cr13)', standards: ['DIN EN 10088-2'] },
            { id: '440c', name: '440C (X105CrMo17)', standards: ['DIN EN 10088-2'] },
            { id: '17-4ph', name: '17-4PH (X5CrNiCuNb16-4)', standards: ['ASTM A564'] },
            { id: '15-5ph', name: '15-5PH (X5CrNiCuNb15-5)', standards: ['ASTM A564'] },
            { id: '13-8ph', name: '13-8PH (X3CrNiMoAl13-8-2)', standards: ['ASTM A564'] }
          ]
        },
              {
          id: 'ferritic',
          name: 'Ferritik',
          grades: [
            { id: '405', name: '405 (X6CrAl13)', standards: ['DIN EN 10088-2'] },
            { id: '409', name: '409 (X2CrTi12)', standards: ['DIN EN 10088-2'] },
            { id: '410s', name: '410S (X6CrNi13)', standards: ['DIN EN 10088-2'] },
            { id: '430', name: '430 (X6Cr17)', standards: ['DIN EN 10088-2'] },
            { id: '434', name: '434 (X6CrMo17-1)', standards: ['DIN EN 10088-2'] },
            { id: '436', name: '436 (X6CrMo18)', standards: ['DIN EN 10088-2'] },
            { id: '441', name: '441 (X2CrTiNb18)', standards: ['DIN EN 10088-2'] },
            { id: '444', name: '444 (X2CrMoTi18-2)', standards: ['DIN EN 10088-2'] },
            { id: '446', name: '446 (X18CrN28)', standards: ['DIN EN 10088-2'] }
          ]
        },
              {
          id: 'duplex',
          name: 'Duplex',
          grades: [
            { id: '2101', name: '2101 (X2CrMnNiN21-5-1)', standards: ['DIN EN 10088-2'] },
            { id: '2202', name: '2202 (X2CrMnNiN22-3-3)', standards: ['DIN EN 10088-2'] },
            { id: '2304', name: '2304 (X2CrNiN23-4)', standards: ['DIN EN 10088-2'] },
            { id: '2205', name: '2205 (X2CrNiMoN22-5-3)', standards: ['DIN EN 10088-2'] },
            { id: '2507', name: '2507 (X2CrNiMoN25-7-4)', standards: ['DIN EN 10088-2'] },
            { id: '2906', name: 'SAF 2906 (X1CrNiMoCuN25-6-3)', standards: ['DIN EN 10088-2'] },
            { id: '32750', name: '32750 (X2CrNiMoN25-7-4)', standards: ['ASTM A240'] },
            { id: '32760', name: '32760 (X1CrNiMoCuN25-6-3)', standards: ['ASTM A240'] }
          ]
        }
    ]
  },
  {
    id: 'aluminum',
    name: 'Alüminyum',
    subCategories: [
      {
        id: 'al_1000',
        name: '1000 Serisi (Saf Al)',
        grades: [
          { id: '1050', name: '1050', standards: ['DIN EN 573-3', 'ASTM B209'] },
          { id: '1060', name: '1060', standards: ['DIN EN 573-3', 'ASTM B209'] },
          { id: '1070', name: '1070', standards: ['DIN EN 573-3'] },
          { id: '1080', name: '1080', standards: ['DIN EN 573-3'] },
          { id: '1085', name: '1085', standards: ['DIN EN 573-3'] },
          { id: '1100', name: '1100', standards: ['ASTM B209'] },
          { id: '1145', name: '1145', standards: ['ASTM B209'] },
          { id: '1200', name: '1200', standards: ['DIN EN 573-3'] },
          { id: '1350', name: '1350', standards: ['ASTM B609'] }
        ]
      },
      {
        id: 'al_2000',
        name: '2000 Serisi (Al-Cu)',
        grades: [
          { id: '2007', name: '2007', standards: ['ASTM B211'] },
          { id: '2011', name: '2011', standards: ['ASTM B211'] },
          { id: '2014', name: '2014', standards: ['ASTM B211'] },
          { id: '2017', name: '2017', standards: ['DIN EN 573-3'] },
          { id: '2024', name: '2024', standards: ['ASTM B211', 'DIN EN 573-3'] },
          { id: '2025', name: '2025', standards: ['DIN EN 573-3'] },
          { id: '2030', name: '2030', standards: ['DIN EN 573-3'] },
          { id: '2117', name: '2117', standards: ['ASTM B211'] },
          { id: '2124', name: '2124', standards: ['ASTM B211'] },
          { id: '2218', name: '2218', standards: ['ASTM B211'] },
          { id: '2219', name: '2219', standards: ['ASTM B211'] }
        ]
      },
      {
        id: 'al_3000',
        name: '3000 Serisi (Al-Mn)',
        grades: [
          { id: '3003', name: '3003', standards: ['ASTM B209', 'DIN EN 573-3'] },
          { id: '3004', name: '3004', standards: ['ASTM B209'] },
          { id: '3005', name: '3005', standards: ['DIN EN 573-3'] },
          { id: '3103', name: '3103', standards: ['DIN EN 573-3'] },
          { id: '3105', name: '3105', standards: ['ASTM B209', 'DIN EN 573-3'] }
        ]
      },
      {
        id: 'al_4000',
        name: '4000 Serisi (Al-Si)',
        grades: [
          { id: '4006', name: '4006', standards: ['DIN EN 573-3'] },
          { id: '4007', name: '4007', standards: ['DIN EN 573-3'] },
          { id: '4032', name: '4032', standards: ['ASTM B211'] },
          { id: '4043', name: '4043', standards: ['AWS A5.10'] },
          { id: '4045', name: '4045', standards: ['DIN EN 573-3'] },
          { id: '4047', name: '4047', standards: ['DIN EN 573-3'] }
        ]
      },
      {
        id: 'al_5000',
        name: '5000 Serisi (Al-Mg)',
        grades: [
          { id: '5005', name: '5005', standards: ['ASTM B209'] },
          { id: '5019', name: '5019', standards: ['DIN EN 573-3'] },
          { id: '5049', name: '5049', standards: ['DIN EN 573-3'] },
          { id: '5050', name: '5050', standards: ['ASTM B209', 'DIN EN 573-3'] },
          { id: '5052', name: '5052', standards: ['ASTM B209'] },
          { id: '5056', name: '5056', standards: ['ASTM B209'] },
          { id: '5083', name: '5083', standards: ['ASTM B209', 'DIN EN 573-3'] },
          { id: '5086', name: '5086', standards: ['ASTM B209'] },
          { id: '5154', name: '5154', standards: ['ASTM B209'] },
          { id: '5182', name: '5182', standards: ['DIN EN 573-3'] },
          { id: '5251', name: '5251', standards: ['DIN EN 573-3'] },
          { id: '5454', name: '5454', standards: ['ASTM B209', 'DIN EN 573-3'] },
          { id: '5754', name: '5754', standards: ['DIN EN 573-3'] }
        ]
      },
      {
        id: 'al_6000',
        name: '6000 Serisi (Al-Mg-Si)',
        grades: [
          { id: '6005', name: '6005', standards: ['DIN EN 573-3'] },
          { id: '6005a', name: '6005A', standards: ['DIN EN 573-3'] },
          { id: '6060', name: '6060', standards: ['DIN EN 573-3'] },
          { id: '6061', name: '6061', standards: ['ASTM B211', 'DIN EN 573-3'] },
          { id: '6063', name: '6063', standards: ['ASTM B221', 'DIN EN 573-3'] },
          { id: '6066', name: '6066', standards: ['ASTM B211'] },
          { id: '6070', name: '6070', standards: ['DIN EN 573-3'] },
          { id: '6082', name: '6082', standards: ['DIN EN 573-3'] },
          { id: '6101', name: '6101', standards: ['ASTM B317'] },
          { id: '6105', name: '6105', standards: ['DIN EN 573-3'] },
          { id: '6106', name: '6106', standards: ['DIN EN 573-3'] },
          { id: '6110', name: '6110', standards: ['DIN EN 573-3'] },
          { id: '6181', name: '6181', standards: ['DIN EN 573-3'] },
          { id: '6201', name: '6201', standards: ['ASTM B398'] },
          { id: '6351', name: '6351', standards: ['ASTM B211'] },
          { id: '6463', name: '6463', standards: ['DIN EN 573-3'] }
        ]
      },
      {
        id: 'al_7000',
        name: '7000 Serisi (Al-Zn)',
        grades: [
          { id: '7003', name: '7003', standards: ['DIN EN 573-3'] },
          { id: '7005', name: '7005', standards: ['DIN EN 573-3'] },
          { id: '7020', name: '7020', standards: ['DIN EN 573-3'] },
          { id: '7022', name: '7022', standards: ['DIN EN 573-3'] },
          { id: '7039', name: '7039', standards: ['ASTM B211'] },
          { id: '7046', name: '7046', standards: ['DIN EN 573-3'] },
          { id: '7049', name: '7049', standards: ['ASTM B211'] },
          { id: '7050', name: '7050', standards: ['ASTM B211'] },
          { id: '7068', name: '7068', standards: ['ASTM B211'] },
          { id: '7072', name: '7072', standards: ['ASTM B209'] },
          { id: '7075', name: '7075', standards: ['ASTM B211', 'DIN EN 573-3'] },
          { id: '7108', name: '7108', standards: ['DIN EN 573-3'] },
          { id: '7129', name: '7129', standards: ['ASTM B211'] },
          { id: '7150', name: '7150', standards: ['ASTM B211'] },
          { id: '7175', name: '7175', standards: ['ASTM B211'] },
          { id: '7178', name: '7178', standards: ['ASTM B211'] }
        ]
      },
      {
        id: 'al_8000',
        name: '8000 Serisi (Diğer)',
        grades: [
          { id: '8006', name: '8006', standards: ['ASTM B209'] },
          { id: '8011', name: '8011', standards: ['ASTM B209', 'DIN EN 573-3'] },
          { id: '8079', name: '8079', standards: ['ASTM B209', 'DIN EN 573-3'] },
          { id: '8090', name: '8090', standards: ['ASTM B211'] },
          { id: '8176', name: '8176', standards: ['DIN EN 573-3'] }
        ]
      }
    ]
  },
  {
    id: 'copper',
    name: 'Bakır ve Alaşımları',
    subCategories: [
      {
        id: 'pure_copper',
        name: 'Saf Bakır',
        grades: [
          { id: 'cu_ofhc', name: 'OFHC Bakır', standards: ['ASTM B152'] },
          { id: 'cu_ead', name: 'EAD Bakır', standards: ['DIN EN 1172'] }
        ]
      },
      {
        id: 'brass',
        name: 'Pirinç',
        grades: [
          { id: 'cuzn37', name: 'CuZn37', standards: ['DIN EN 12163'] },
          { id: 'cuzn39pb3', name: 'CuZn39Pb3', standards: ['DIN EN 12163'] }
        ]
      },
      {
        id: 'bronze',
        name: 'Bronz',
        grades: [
          { id: 'cusn8', name: 'CuSn8', standards: ['DIN EN 1982'] },
          { id: 'cual10ni5fe4', name: 'CuAl10Ni5Fe4', standards: ['DIN EN 1982'] }
        ]
      }
    ]
  },
  {
    id: 'titanium',
    name: 'Titanyum ve Alaşımları',
    subCategories: [
      {
        id: 'ti_pure',
        name: 'Saf Titanyum',
        grades: [
          { id: 'ti_grade2', name: 'Grade 2', standards: ['ASTM B265'] },
          { id: 'ti_grade4', name: 'Grade 4', standards: ['ASTM B265'] }
        ]
      },
      {
        id: 'ti_alloy',
        name: 'Titanyum Alaşımı',
        grades: [
          { id: 'ti6al4v', name: 'Ti-6Al-4V (Grade 5)', standards: ['ASTM B265', 'DIN 17851'] },
          { id: 'ti6al2sn4zr2mo', name: 'Ti-6Al-2Sn-4Zr-2Mo', standards: ['ASTM B265'] }
        ]
      }
    ]
  },
  {
    id: 'cast_iron',
    name: 'Döküm Malzemeler',
    subCategories: [
      {
        id: 'gray_iron',
        name: 'Gri Döküm',
        grades: [
          { id: 'ggg40', name: 'GGG-40', standards: ['DIN EN 1561'] },
          { id: 'ggg50', name: 'GGG-50', standards: ['DIN EN 1561'] }
        ]
      },
      {
        id: 'ductile_iron',
        name: 'Küresel Grafitli Döküm',
        grades: [
          { id: 'gjs400', name: 'GJS-400-15', standards: ['DIN EN 1563'] },
          { id: 'gjs500', name: 'GJS-500-7', standards: ['DIN EN 1563'] }
        ]
      }
    ]
  }
];

// Context7 Enhanced Material Standards Database - Extended for comprehensive coverage
const materialStandards: MaterialStandard[] = [
  {
    id: 's355j2_din_10025_2',
    name: 'S355J2 - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j2',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Çentik Darbe (Charpy V) -40°C', minValue: 20, maxValue: 45, unit: 'J', testMethod: 'ISO 148-1 (-40°C)', typical: 28 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  {
    id: 's235jr_din_10025_2',
    name: 'S235JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's235jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.17, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Mn', minValue: 0, maxValue: 1.40, typical: 0.70 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 360, maxValue: 510, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 435 },
      { property: 'Akma Dayanımı', minValue: 235, maxValue: 360, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 250 },
      { property: 'Uzama', minValue: 26, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 35, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 45 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 55, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 35 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 120, maxValue: 170, testPosition: 'Yüzey', typical: 145 }
    ]
  },
  {
    id: 's275n_din_10025_3',
    name: 'S275N - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275n',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.18, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 0.50, typical: 0.25 },
      { element: 'Mn', minValue: 0.40, maxValue: 1.50, typical: 0.95 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 390, maxValue: 540, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 465 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 395, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 26 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 },
      { property: 'Çentik Darbe (Charpy V) -50°C', minValue: 20, maxValue: 45, unit: 'J', testMethod: 'ISO 148-1 (-50°C)', typical: 28 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 130, maxValue: 180, testPosition: 'Yüzey', typical: 155 }
    ]
  },
  {
    id: 's355j2_din_10025_3',
    name: 'S355J2 - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355j2',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.20, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  {
    id: 's460n_din_10025_3',
    name: 'S460N - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's460n',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.20, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.60, typical: 0.30 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.70, typical: 1.35 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 540, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 630 },
      { property: 'Akma Dayanımı', minValue: 460, maxValue: 580, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 520 },
      { property: 'Uzama', minValue: 17, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 55 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 35 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 210, testPosition: 'Yüzey', typical: 180 }
    ]
  },
  {
    id: '42crmo4_din_10083_3',
    name: '42CrMo4 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '42crmo4',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.38, maxValue: 0.45, typical: 0.42 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.60, maxValue: 0.90, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1000, maxValue: 1200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1100 },
      { property: 'Akma Dayanımı', minValue: 800, maxValue: 950, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Uzama', minValue: 14, maxValue: 20, unit: '%', testMethod: 'ISO 6892-1', typical: 16 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 70, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 85 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 60, maxValue: 100, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 75 },
      { property: 'Çentik Darbe (Charpy V) -40°C', minValue: 45, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-40°C)', typical: 60 },
      { property: 'Yorulma Dayanımı', minValue: 450, maxValue: 550, unit: 'MPa', testMethod: 'ISO 1099', typical: 500 },
      { property: 'Kırılma Tokluğu', minValue: 80, maxValue: 120, unit: 'MPa√m', testMethod: 'ASTM E399', typical: 100 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 28, maxValue: 35, testPosition: 'Çekirdek', typical: 32 },
      { type: 'HB', minValue: 270, maxValue: 330, testPosition: 'Yüzey', typical: 300 }
    ]
  },
  {
    id: '304_din_10088_2',
    name: '304 (X5CrNi18-10) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '304',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.07, typical: 0.05 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 17.50, maxValue: 19.50, typical: 18.50 },
      { element: 'Ni', minValue: 8.00, maxValue: 10.50, typical: 9.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 620 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Çentik Darbe (Charpy V) -196°C', minValue: 120, maxValue: 200, unit: 'J', testMethod: 'ISO 148-1 (-196°C)', typical: 150 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 },
      { property: 'Aşınma Direnci', minValue: 200, maxValue: 300, unit: 'HV', testMethod: 'ASTM G99', typical: 250 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 },
      { type: 'HRC', minValue: 0, maxValue: 25, testPosition: 'Yüzey', typical: 15 }
    ]
  },
  {
    id: '316l_din_10088_2',
    name: '316L (X2CrNiMo17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316l',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.030, typical: 0.020 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.00, maxValue: 13.00, typical: 11.50 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 620, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 170, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 220 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 180, maxValue: 280, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 220 },
      { property: 'Çentik Darbe (Charpy V) -196°C', minValue: 100, maxValue: 180, unit: 'J', testMethod: 'ISO 148-1 (-196°C)', typical: 140 },
      { property: 'Korozyon Direnci', minValue: 24, maxValue: 72, unit: 'saat', testMethod: 'ASTM A262', typical: 48 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  {
    id: '6061_astm_b211',
    name: '6061 - ASTM B211',
    category: 'aluminum',
    subCategory: 'al_6000',
    grade: '6061',
    standard: 'ASTM B211',
    chemicalComposition: [
      { element: 'Si', minValue: 0.40, maxValue: 0.80, typical: 0.60 },
      { element: 'Fe', minValue: 0, maxValue: 0.70, typical: 0.35 },
      { element: 'Cu', minValue: 0.15, maxValue: 0.40, typical: 0.28 },
      { element: 'Mn', minValue: 0, maxValue: 0.15, typical: 0.08 },
      { element: 'Mg', minValue: 0.80, maxValue: 1.20, typical: 1.00 },
      { element: 'Cr', minValue: 0.04, maxValue: 0.35, typical: 0.20 },
      { element: 'Zn', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Ti', minValue: 0, maxValue: 0.15, typical: 0.07 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 290, maxValue: 330, unit: 'MPa', testMethod: 'ASTM B557', typical: 310 },
      { property: 'Akma Dayanımı', minValue: 240, maxValue: 280, unit: 'MPa', testMethod: 'ASTM B557', typical: 260 },
      { property: 'Uzama', minValue: 8, maxValue: 17, unit: '%', testMethod: 'ASTM B557', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 20, maxValue: 35, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -40°C', minValue: 15, maxValue: 25, unit: 'J', testMethod: 'ASTM E23 (-40°C)', typical: 18 },
      { property: 'Elastisite Modülü', minValue: 68, maxValue: 72, unit: 'GPa', testMethod: 'ASTM E111', typical: 70 },
      { property: 'Yorulma Dayanımı', minValue: 90, maxValue: 110, unit: 'MPa', testMethod: 'ASTM D7791', typical: 100 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 90, maxValue: 110, testPosition: 'Yüzey', typical: 100 }
    ]
  },
  {
    id: 'ti6al4v_astm_b265',
    name: 'Ti-6Al-4V (Grade 5) - ASTM B265',
    category: 'titanium',
    subCategory: 'ti_alloy',
    grade: 'ti6al4v',
    standard: 'ASTM B265',
    chemicalComposition: [
      { element: 'Al', minValue: 5.50, maxValue: 6.75, typical: 6.10 },
      { element: 'V', minValue: 3.50, maxValue: 4.50, typical: 4.00 },
      { element: 'Fe', minValue: 0, maxValue: 0.30, typical: 0.15 },
      { element: 'O', minValue: 0, maxValue: 0.20, typical: 0.10 },
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.04 },
      { element: 'N', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'H', minValue: 0, maxValue: 0.015, typical: 0.008 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 895, maxValue: 1050, unit: 'MPa', testMethod: 'ASTM E8', typical: 950 },
      { property: 'Akma Dayanımı', minValue: 825, maxValue: 950, unit: 'MPa', testMethod: 'ASTM E8', typical: 880 },
      { property: 'Uzama', minValue: 10, maxValue: 18, unit: '%', testMethod: 'ASTM E8', typical: 14 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 20, maxValue: 40, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) -54°C', minValue: 15, maxValue: 30, unit: 'J', testMethod: 'ASTM E23 (-54°C)', typical: 22 },
      { property: 'Elastisite Modülü', minValue: 110, maxValue: 120, unit: 'GPa', testMethod: 'ASTM E111', typical: 114 },
      { property: 'Yorulma Dayanımı', minValue: 400, maxValue: 500, unit: 'MPa', testMethod: 'ASTM D7791', typical: 450 },
      { property: 'Kırılma Tokluğu', minValue: 50, maxValue: 80, unit: 'MPa√m', testMethod: 'ASTM E399', typical: 65 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 32, maxValue: 38, testPosition: 'Yüzey', typical: 35 }
    ]
  },
  
  // === YAPISAL ÇELİKLER (STRUCTURAL STEEL) - KAPSAMLI VERİ TABANI ===
  
  // S275JR - DIN EN 10025-2
  {
    id: 's275jr_din_10025_2',
    name: 'S275JR - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's275jr',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.21, typical: 0.15 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 410, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 485 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 295 },
      { property: 'Uzama', minValue: 23, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 27 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 27, maxValue: 70, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 45 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 125, maxValue: 175, testPosition: 'Yüzey', typical: 150 }
    ]
  },
  
  // S355JO - DIN EN 10025-2
  {
    id: 's355jo_din_10025_2',
    name: 'S355JO - DIN EN 10025-2',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355jo',
    standard: 'DIN EN 10025-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.22, typical: 0.16 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.60, typical: 1.30 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) 0°C', minValue: 27, maxValue: 60, unit: 'J', testMethod: 'ISO 148-1 (0°C)', typical: 40 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S355K2 - DIN EN 10025-3
  {
    id: 's355k2_din_10025_3',
    name: 'S355K2 - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's355k2',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.18, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.55, typical: 0.25 },
      { element: 'Mn', minValue: 0.50, maxValue: 1.60, typical: 1.05 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.012, typical: 0.008 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 470, maxValue: 630, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 355, maxValue: 500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 380 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 55 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // S420N - DIN EN 10025-3
  {
    id: 's420n_din_10025_3',
    name: 'S420N - DIN EN 10025-3',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's420n',
    standard: 'DIN EN 10025-3',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.20, typical: 0.14 },
      { element: 'Si', minValue: 0, maxValue: 0.60, typical: 0.30 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.70, typical: 1.35 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.018 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'N', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 520, maxValue: 680, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 600 },
      { property: 'Akma Dayanımı', minValue: 420, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 490 },
      { property: 'Uzama', minValue: 19, maxValue: 30, unit: '%', testMethod: 'ISO 6892-1', typical: 22 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 55 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 145, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // S460M - DIN EN 10025-4
  {
    id: 's460m_din_10025_4',
    name: 'S460M - DIN EN 10025-4',
    category: 'steel',
    subCategory: 'structural_steel',
    grade: 's460m',
    standard: 'DIN EN 10025-4',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.12, typical: 0.08 },
      { element: 'Si', minValue: 0, maxValue: 0.80, typical: 0.40 },
      { element: 'Mn', minValue: 1.00, maxValue: 1.70, typical: 1.35 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'N', minValue: 0, maxValue: 0.015, typical: 0.010 },
      { element: 'Al', minValue: 0.020, maxValue: 0.080, typical: 0.035 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 540, maxValue: 720, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 630 },
      { property: 'Akma Dayanımı', minValue: 460, maxValue: 580, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 520 },
      { property: 'Uzama', minValue: 17, maxValue: 28, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) -20°C', minValue: 40, maxValue: 80, unit: 'J', testMethod: 'ISO 148-1 (-20°C)', typical: 55 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 210, testPosition: 'Yüzey', typical: 180 }
    ]
  },
  
  // === ALAŞIMLI ÇELİKLER (ALLOY STEEL) - KAPSAMLI VERİ TABANI ===
  
  // 34CrMo4 - DIN EN 10083-3
  {
    id: '34crmo4_din_10083_3',
    name: '34CrMo4 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '34crmo4',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.30, maxValue: 0.37, typical: 0.34 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.60, maxValue: 0.90, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 900, maxValue: 1100, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1000 },
      { property: 'Akma Dayanımı', minValue: 700, maxValue: 850, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 800 },
      { property: 'Uzama', minValue: 16, maxValue: 22, unit: '%', testMethod: 'ISO 6892-1', typical: 18 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 80, maxValue: 130, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 100 },
      { property: 'Yorulma Dayanımı', minValue: 420, maxValue: 520, unit: 'MPa', testMethod: 'ISO 1099', typical: 470 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 25, maxValue: 32, testPosition: 'Çekirdek', typical: 29 },
      { type: 'HB', minValue: 250, maxValue: 310, testPosition: 'Yüzey', typical: 280 }
    ]
  },
  
  // 25CrMo4 - DIN EN 10083-3
  {
    id: '25crmo4_din_10083_3',
    name: '25CrMo4 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '25crmo4',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.22, maxValue: 0.29, typical: 0.25 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.60, maxValue: 0.90, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'Mo', minValue: 0.15, maxValue: 0.30, typical: 0.22 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 900 },
      { property: 'Akma Dayanımı', minValue: 600, maxValue: 750, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 700 },
      { property: 'Uzama', minValue: 18, maxValue: 25, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 90, maxValue: 140, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 115 },
      { property: 'Yorulma Dayanımı', minValue: 380, maxValue: 480, unit: 'MPa', testMethod: 'ISO 1099', typical: 430 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 22, maxValue: 28, testPosition: 'Çekirdek', typical: 25 },
      { type: 'HB', minValue: 220, maxValue: 280, testPosition: 'Yüzey', typical: 250 }
    ]
  },
  
  // 30CrNiMo8 - DIN EN 10083-3
  {
    id: '30crnimo8_din_10083_3',
    name: '30CrNiMo8 - DIN EN 10083-3',
    category: 'steel',
    subCategory: 'alloy_steel',
    grade: '30crnimo8',
    standard: 'DIN EN 10083-3',
    chemicalComposition: [
      { element: 'C', minValue: 0.26, maxValue: 0.34, typical: 0.30 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.25 },
      { element: 'Mn', minValue: 0.30, maxValue: 0.60, typical: 0.45 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'Cr', minValue: 1.80, maxValue: 2.20, typical: 2.00 },
      { element: 'Ni', minValue: 1.80, maxValue: 2.20, typical: 2.00 },
      { element: 'Mo', minValue: 0.30, maxValue: 0.50, typical: 0.40 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1100, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1200 },
      { property: 'Akma Dayanımı', minValue: 900, maxValue: 1100, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1000 },
      { property: 'Uzama', minValue: 12, maxValue: 18, unit: '%', testMethod: 'ISO 6892-1', typical: 15 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 100, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 80 },
      { property: 'Yorulma Dayanımı', minValue: 500, maxValue: 600, unit: 'MPa', testMethod: 'ISO 1099', typical: 550 },
      { property: 'Kırılma Tokluğu', minValue: 70, maxValue: 110, unit: 'MPa√m', testMethod: 'ASTM E399', typical: 90 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 32, maxValue: 39, testPosition: 'Çekirdek', typical: 36 },
      { type: 'HB', minValue: 300, maxValue: 370, testPosition: 'Yüzey', typical: 335 }
    ]
  },
  
  // === TAKIM ÇELİKLERİ (TOOL STEEL) - KAPSAMLI VERİ TABANI ===
  
  {
    id: '1.2379_din_4957',
    name: '1.2379 (D2) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2379',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 1.45, maxValue: 1.60, typical: 1.52 },
      { element: 'Si', minValue: 0.15, maxValue: 0.60, typical: 0.35 },
      { element: 'Mn', minValue: 0.20, maxValue: 0.60, typical: 0.40 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 11.00, maxValue: 13.00, typical: 12.00 },
      { element: 'Mo', minValue: 0.70, maxValue: 1.20, typical: 0.95 },
      { element: 'V', minValue: 0.50, maxValue: 1.10, typical: 0.80 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1800, maxValue: 2200, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 2000 },
      { property: 'Akma Dayanımı', minValue: 1600, maxValue: 1900, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1750 },
      { property: 'Uzama', minValue: 5, maxValue: 12, unit: '%', testMethod: 'ISO 6892-1', typical: 8 },
      { property: 'Aşınma Direnci', minValue: 60, maxValue: 65, unit: 'HRC', testMethod: 'ASTM A681', typical: 62 },
      { property: 'Basma Dayanımı', minValue: 2800, maxValue: 3200, unit: 'MPa', testMethod: 'ASTM E9', typical: 3000 },
      { property: 'Yorulma Dayanımı', minValue: 800, maxValue: 1000, unit: 'MPa', testMethod: 'ISO 1099', typical: 900 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 58, maxValue: 64, testPosition: 'Yüzey', typical: 61 }
    ]
  },
  
  // 1.2343 (H11) - DIN EN ISO 4957
  {
    id: '1.2343_din_4957',
    name: '1.2343 (H11) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2343',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 0.33, maxValue: 0.41, typical: 0.37 },
      { element: 'Si', minValue: 0.80, maxValue: 1.20, typical: 1.00 },
      { element: 'Mn', minValue: 0.25, maxValue: 0.50, typical: 0.38 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 4.80, maxValue: 5.50, typical: 5.15 },
      { element: 'Mo', minValue: 1.10, maxValue: 1.50, typical: 1.30 },
      { element: 'V', minValue: 0.30, maxValue: 0.50, typical: 0.40 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1200, maxValue: 1500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1350 },
      { property: 'Akma Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Uzama', minValue: 8, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 20, maxValue: 40, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 30 },
      { property: 'Sıcaklık Direnci', minValue: 550, maxValue: 600, unit: '°C', testMethod: 'DIN EN ISO 4957', typical: 575 },
      { property: 'Termal Şok Direnci', minValue: 400, maxValue: 500, unit: '°C', testMethod: 'DIN EN ISO 4957', typical: 450 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 38, maxValue: 44, testPosition: 'Yüzey', typical: 41 }
    ]
  },
  
  // 1.2367 (H10) - DIN EN ISO 4957
  {
    id: '1.2367_din_4957',
    name: '1.2367 (H10) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2367',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 0.35, maxValue: 0.42, typical: 0.39 },
      { element: 'Si', minValue: 0.80, maxValue: 1.20, typical: 1.00 },
      { element: 'Mn', minValue: 0.25, maxValue: 0.50, typical: 0.38 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 3.00, maxValue: 3.75, typical: 3.38 },
      { element: 'Mo', minValue: 2.20, maxValue: 3.20, typical: 2.70 },
      { element: 'V', minValue: 0.30, maxValue: 0.60, typical: 0.45 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1300, maxValue: 1600, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1450 },
      { property: 'Akma Dayanımı', minValue: 1100, maxValue: 1400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1250 },
      { property: 'Uzama', minValue: 7, maxValue: 14, unit: '%', testMethod: 'ISO 6892-1', typical: 10 },
      { property: 'Sıcaklık Direnci', minValue: 580, maxValue: 630, unit: '°C', testMethod: 'DIN EN ISO 4957', typical: 605 },
      { property: 'Termal Kondüktivite', minValue: 25, maxValue: 30, unit: 'W/mK', testMethod: 'ISO 22007', typical: 27 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 40, maxValue: 46, testPosition: 'Yüzey', typical: 43 }
    ]
  },
  
  // 1.2436 (D6) - DIN EN ISO 4957
  {
    id: '1.2436_din_4957',
    name: '1.2436 (D6) - DIN EN ISO 4957',
    category: 'steel',
    subCategory: 'tool_steel',
    grade: '1.2436',
    standard: 'DIN EN ISO 4957',
    chemicalComposition: [
      { element: 'C', minValue: 2.00, maxValue: 2.10, typical: 2.05 },
      { element: 'Si', minValue: 0.10, maxValue: 0.60, typical: 0.35 },
      { element: 'Mn', minValue: 0.20, maxValue: 0.60, typical: 0.40 },
      { element: 'P', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 11.50, maxValue: 13.50, typical: 12.50 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1900, maxValue: 2300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 2100 },
      { property: 'Akma Dayanımı', minValue: 1700, maxValue: 2000, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1850 },
      { property: 'Uzama', minValue: 3, maxValue: 8, unit: '%', testMethod: 'ISO 6892-1', typical: 5 },
      { property: 'Aşınma Direnci', minValue: 62, maxValue: 66, unit: 'HRC', testMethod: 'ASTM A681', typical: 64 },
      { property: 'Basma Dayanımı', minValue: 3000, maxValue: 3500, unit: 'MPa', testMethod: 'ASTM E9', typical: 3250 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 60, maxValue: 66, testPosition: 'Yüzey', typical: 63 }
    ]
  },
  
  // === YAY ÇELİKLERİ (SPRING STEEL) - KAPSAMLI VERİ TABANI ===
  
  // 51CrV4 - DIN EN 10089
  {
    id: '51crv4_din_10089',
    name: '51CrV4 - DIN EN 10089',
    category: 'steel',
    subCategory: 'spring_steel',
    grade: '51crv4',
    standard: 'DIN EN 10089',
    chemicalComposition: [
      { element: 'C', minValue: 0.47, maxValue: 0.55, typical: 0.51 },
      { element: 'Si', minValue: 0.15, maxValue: 0.40, typical: 0.28 },
      { element: 'Mn', minValue: 0.70, maxValue: 1.10, typical: 0.90 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'Cr', minValue: 0.90, maxValue: 1.20, typical: 1.05 },
      { element: 'V', minValue: 0.10, maxValue: 0.25, typical: 0.18 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1200, maxValue: 1500, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1350 },
      { property: 'Akma Dayanımı', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1150 },
      { property: 'Uzama', minValue: 8, maxValue: 15, unit: '%', testMethod: 'ISO 6892-1', typical: 12 },
      { property: 'Elastik Limit', minValue: 950, maxValue: 1200, unit: 'MPa', testMethod: 'DIN EN 10089', typical: 1075 },
      { property: 'Yorulma Dayanımı', minValue: 500, maxValue: 650, unit: 'MPa', testMethod: 'ISO 1099', typical: 575 },
      { property: 'Elastisite Modülü', minValue: 200, maxValue: 220, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 210 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 38, maxValue: 45, testPosition: 'Yüzey', typical: 42 }
    ]
  },
  
  // 60Si7 - DIN EN 10089
  {
    id: '60si7_din_10089',
    name: '60Si7 - DIN EN 10089',
    category: 'steel',
    subCategory: 'spring_steel',
    grade: '60si7',
    standard: 'DIN EN 10089',
    chemicalComposition: [
      { element: 'C', minValue: 0.56, maxValue: 0.64, typical: 0.60 },
      { element: 'Si', minValue: 1.50, maxValue: 2.00, typical: 1.75 },
      { element: 'Mn', minValue: 0.60, maxValue: 1.00, typical: 0.80 },
      { element: 'P', minValue: 0, maxValue: 0.025, typical: 0.015 },
      { element: 'S', minValue: 0, maxValue: 0.025, typical: 0.015 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 1300, maxValue: 1600, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1450 },
      { property: 'Akma Dayanımı', minValue: 1100, maxValue: 1400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 1250 },
      { property: 'Uzama', minValue: 6, maxValue: 12, unit: '%', testMethod: 'ISO 6892-1', typical: 9 },
      { property: 'Elastik Limit', minValue: 1000, maxValue: 1300, unit: 'MPa', testMethod: 'DIN EN 10089', typical: 1150 },
      { property: 'Yorulma Dayanımı', minValue: 550, maxValue: 700, unit: 'MPa', testMethod: 'ISO 1099', typical: 625 }
    ],
        hardnessRequirements: [
      { type: 'HRC', minValue: 40, maxValue: 47, testPosition: 'Yüzey', typical: 44 }
    ]
  },
  
  // === PASLANMAZ ÇELİKLER (STAINLESS STEEL) - KAPSAMLI VERİ TABANI ===
  
  // 201 (X12CrMnNi17-7-5) - DIN EN 10088-2
  {
    id: '201_din_10088_2',
    name: '201 (X12CrMnNi17-7-5) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '201',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.15, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 5.50, maxValue: 7.50, typical: 6.50 },
      { element: 'P', minValue: 0, maxValue: 0.060, typical: 0.040 },
      { element: 'S', minValue: 0, maxValue: 0.030, typical: 0.015 },
      { element: 'Cr', minValue: 16.00, maxValue: 18.00, typical: 17.00 },
      { element: 'Ni', minValue: 3.50, maxValue: 5.50, typical: 4.50 },
      { element: 'N', minValue: 0.25, maxValue: 0.40, typical: 0.32 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 515, maxValue: 680, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 600 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 350, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 280 },
      { property: 'Uzama', minValue: 35, maxValue: 55, unit: '%', testMethod: 'ISO 6892-1', typical: 45 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 100, maxValue: 200, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 150 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 },
      { property: 'Manyetik Geçirgenlik', minValue: 1.002, maxValue: 1.020, unit: '', testMethod: 'ASTM A342', typical: 1.010 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 160, maxValue: 220, testPosition: 'Yüzey', typical: 190 }
    ]
  },
  
  // 316Ti (X6CrNiMoTi17-12-2) - DIN EN 10088-2
  {
    id: '316ti_din_10088_2',
    name: '316Ti (X6CrNiMoTi17-12-2) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '316ti',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.06 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.50, maxValue: 18.50, typical: 17.50 },
      { element: 'Ni', minValue: 10.50, maxValue: 13.50, typical: 12.00 },
      { element: 'Mo', minValue: 2.00, maxValue: 2.50, typical: 2.25 },
      { element: 'Ti', minValue: 0.70, maxValue: 1.00, typical: 0.85 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 620, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Akma Dayanımı', minValue: 170, maxValue: 310, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 240 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 180, maxValue: 280, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 220 },
      { property: 'Korozyon Direnci', minValue: 72, maxValue: 168, unit: 'saat', testMethod: 'ASTM A262', typical: 120 },
      { property: 'Yüksek Sıcaklık Dayanımı', minValue: 600, maxValue: 800, unit: '°C', testMethod: 'ASTM A240', typical: 700 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 140, maxValue: 190, testPosition: 'Yüzey', typical: 165 }
    ]
  },
  
  // 321 (X6CrNiTi18-10) - DIN EN 10088-2
  {
    id: '321_din_10088_2',
    name: '321 (X6CrNiTi18-10) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'austenitic',
    grade: '321',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.06 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.045, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 17.00, maxValue: 19.00, typical: 18.00 },
      { element: 'Ni', minValue: 9.00, maxValue: 12.00, typical: 10.50 },
      { element: 'Ti', minValue: 0.70, maxValue: 1.00, typical: 0.85 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 485, maxValue: 680, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 580 },
      { property: 'Akma Dayanımı', minValue: 205, maxValue: 350, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 280 },
      { property: 'Uzama', minValue: 40, maxValue: 70, unit: '%', testMethod: 'ISO 6892-1', typical: 50 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 200, maxValue: 300, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 250 },
      { property: 'Yüksek Sıcaklık Mukavemeti', minValue: 500, maxValue: 700, unit: '°C', testMethod: 'ASTM A240', typical: 600 },
      { property: 'Elastisite Modülü', minValue: 190, maxValue: 210, unit: 'GPa', testMethod: 'ISO 6892-1', typical: 200 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 200, testPosition: 'Yüzey', typical: 175 }
    ]
  },
  
  // 410 (X12Cr13) - Martensitik Paslanmaz
  {
    id: '410_din_10088_2',
    name: '410 (X12Cr13) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'martensitic',
    grade: '410',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.08, maxValue: 0.15, typical: 0.12 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.040, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 11.50, maxValue: 13.50, typical: 12.50 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 450, maxValue: 700, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 575 },
      { property: 'Akma Dayanımı', minValue: 200, maxValue: 400, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 300 },
      { property: 'Uzama', minValue: 20, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 80, maxValue: 150, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 115 },
      { property: 'Manyetik Özellik', minValue: 1, maxValue: 1, unit: 'Ferromanyetik', testMethod: 'ASTM A342', typical: 1 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 22, maxValue: 32, testPosition: 'Yüzey', typical: 27 },
      { type: 'HB', minValue: 200, maxValue: 300, testPosition: 'Yüzey', typical: 250 }
    ]
  },
  
  // 420 (X20Cr13) - Martensitik Paslanmaz
  {
    id: '420_din_10088_2',
    name: '420 (X20Cr13) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'martensitic',
    grade: '420',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0.16, maxValue: 0.25, typical: 0.20 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.040, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 12.00, maxValue: 14.00, typical: 13.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 700, maxValue: 850, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 775 },
      { property: 'Akma Dayanımı', minValue: 400, maxValue: 600, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 500 },
      { property: 'Uzama', minValue: 15, maxValue: 25, unit: '%', testMethod: 'ISO 6892-1', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 90 },
      { property: 'Aşınma Direnci', minValue: 35, maxValue: 45, unit: 'HRC', testMethod: 'ASTM A681', typical: 40 }
    ],
    hardnessRequirements: [
      { type: 'HRC', minValue: 30, maxValue: 40, testPosition: 'Yüzey', typical: 35 }
    ]
  },
  
  // 430 (X6Cr17) - Ferritik Paslanmaz
  {
    id: '430_din_10088_2',
    name: '430 (X6Cr17) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'ferritic',
    grade: '430',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.08, typical: 0.06 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 1.50, typical: 0.75 },
      { element: 'P', minValue: 0, maxValue: 0.040, typical: 0.025 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 16.00, maxValue: 18.00, typical: 17.00 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 420, maxValue: 560, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 490 },
      { property: 'Akma Dayanımı', minValue: 220, maxValue: 350, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 285 },
      { property: 'Uzama', minValue: 22, maxValue: 35, unit: '%', testMethod: 'ISO 6892-1', typical: 28 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 90 },
      { property: 'Manyetik Özellik', minValue: 1, maxValue: 1, unit: 'Ferromanyetik', testMethod: 'ASTM A342', typical: 1 },
      { property: 'Korozyon Direnci', minValue: 12, maxValue: 48, unit: 'saat', testMethod: 'ASTM A262', typical: 24 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 150, maxValue: 220, testPosition: 'Yüzey', typical: 185 }
    ]
  },
  
  // 2205 (X2CrNiMoN22-5-3) - Duplex Paslanmaz
  {
    id: '2205_din_10088_2',
    name: '2205 (X2CrNiMoN22-5-3) - DIN EN 10088-2',
    category: 'stainless',
    subCategory: 'duplex',
    grade: '2205',
    standard: 'DIN EN 10088-2',
    chemicalComposition: [
      { element: 'C', minValue: 0, maxValue: 0.03, typical: 0.02 },
      { element: 'Si', minValue: 0, maxValue: 1.00, typical: 0.50 },
      { element: 'Mn', minValue: 0, maxValue: 2.00, typical: 1.00 },
      { element: 'P', minValue: 0, maxValue: 0.035, typical: 0.020 },
      { element: 'S', minValue: 0, maxValue: 0.015, typical: 0.008 },
      { element: 'Cr', minValue: 21.00, maxValue: 23.00, typical: 22.00 },
      { element: 'Ni', minValue: 4.50, maxValue: 6.50, typical: 5.50 },
      { element: 'Mo', minValue: 2.50, maxValue: 3.50, typical: 3.00 },
      { element: 'N', minValue: 0.08, maxValue: 0.20, typical: 0.14 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 620, maxValue: 880, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 750 },
      { property: 'Akma Dayanımı', minValue: 450, maxValue: 650, unit: 'MPa', testMethod: 'ISO 6892-1', typical: 550 },
      { property: 'Uzama', minValue: 25, maxValue: 40, unit: '%', testMethod: 'ISO 6892-1', typical: 30 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 120, unit: 'J', testMethod: 'ISO 148-1 (+20°C)', typical: 90 },
      { property: 'Korozyon Direnci (PREN)', minValue: 32, maxValue: 40, unit: '', testMethod: 'ASTM G48', typical: 36 },
      { property: 'Çukur Korozyon Direnci', minValue: 250, maxValue: 350, unit: '°C', testMethod: 'ASTM G48', typical: 300 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 230, maxValue: 290, testPosition: 'Yüzey', typical: 260 }
    ]
  },
  
  // === ALÜMİNYUM ALAŞIMLARI - KAPSAMLI VERİ TABANI ===
  
  // 1050 - DIN EN 573-3
  {
    id: '1050_din_573_3',
    name: '1050 - DIN EN 573-3',
    category: 'aluminum',
    subCategory: 'al_1000',
    grade: '1050',
    standard: 'DIN EN 573-3',
    chemicalComposition: [
      { element: 'Al', minValue: 99.50, maxValue: 100.00, typical: 99.75 },
      { element: 'Fe', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Si', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Cu', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'Mn', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'Mg', minValue: 0, maxValue: 0.05, typical: 0.025 },
      { element: 'Zn', minValue: 0, maxValue: 0.07, typical: 0.035 },
      { element: 'Ti', minValue: 0, maxValue: 0.05, typical: 0.025 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 65, maxValue: 95, unit: 'MPa', testMethod: 'ASTM B557', typical: 80 },
      { property: 'Akma Dayanımı', minValue: 20, maxValue: 40, unit: 'MPa', testMethod: 'ASTM B557', typical: 30 },
      { property: 'Uzama', minValue: 35, maxValue: 50, unit: '%', testMethod: 'ASTM B557', typical: 42 },
      { property: 'Elastisite Modülü', minValue: 68, maxValue: 72, unit: 'GPa', testMethod: 'ASTM E111', typical: 70 },
      { property: 'Elektriksel İletkenlik', minValue: 60, maxValue: 65, unit: '%IACS', testMethod: 'ASTM B193', typical: 62 },
      { property: 'Termal İletkenlik', minValue: 230, maxValue: 250, unit: 'W/mK', testMethod: 'ASTM E1461', typical: 240 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 15, maxValue: 25, testPosition: 'Yüzey', typical: 20 }
    ]
  },
  
  // 2024-T4 - ASTM B211
  {
    id: '2024_t4_astm_b211',
    name: '2024-T4 - ASTM B211',
    category: 'aluminum',
    subCategory: 'al_2000',
    grade: '2024',
    standard: 'ASTM B211',
    chemicalComposition: [
      { element: 'Al', minValue: 90.70, maxValue: 94.70, typical: 92.70 },
      { element: 'Cu', minValue: 3.80, maxValue: 4.90, typical: 4.35 },
      { element: 'Mg', minValue: 1.20, maxValue: 1.80, typical: 1.50 },
      { element: 'Mn', minValue: 0.30, maxValue: 0.90, typical: 0.60 },
      { element: 'Fe', minValue: 0, maxValue: 0.50, typical: 0.25 },
      { element: 'Si', minValue: 0, maxValue: 0.50, typical: 0.25 },
      { element: 'Zn', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Ti', minValue: 0, maxValue: 0.15, typical: 0.07 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 425, maxValue: 485, unit: 'MPa', testMethod: 'ASTM B557', typical: 455 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 325, unit: 'MPa', testMethod: 'ASTM B557', typical: 300 },
      { property: 'Uzama', minValue: 15, maxValue: 25, unit: '%', testMethod: 'ASTM B557', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 25, maxValue: 40, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 32 },
      { property: 'Yorulma Dayanımı', minValue: 130, maxValue: 160, unit: 'MPa', testMethod: 'ASTM D7791', typical: 145 },
      { property: 'Elastisite Modülü', minValue: 70, maxValue: 74, unit: 'GPa', testMethod: 'ASTM E111', typical: 72 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 115, maxValue: 135, testPosition: 'Yüzey', typical: 125 }
    ]
  },
  
  // 5083-H111 - DIN EN 573-3
  {
    id: '5083_h111_din_573_3',
    name: '5083-H111 - DIN EN 573-3',
    category: 'aluminum',
    subCategory: 'al_5000',
    grade: '5083',
    standard: 'DIN EN 573-3',
    chemicalComposition: [
      { element: 'Al', minValue: 93.40, maxValue: 96.80, typical: 95.10 },
      { element: 'Mg', minValue: 4.00, maxValue: 4.90, typical: 4.45 },
      { element: 'Mn', minValue: 0.40, maxValue: 1.00, typical: 0.70 },
      { element: 'Cr', minValue: 0.05, maxValue: 0.25, typical: 0.15 },
      { element: 'Fe', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Si', minValue: 0, maxValue: 0.40, typical: 0.20 },
      { element: 'Cu', minValue: 0, maxValue: 0.10, typical: 0.05 },
      { element: 'Zn', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'Ti', minValue: 0, maxValue: 0.15, typical: 0.07 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 270, maxValue: 350, unit: 'MPa', testMethod: 'ASTM B557', typical: 310 },
      { property: 'Akma Dayanımı', minValue: 110, maxValue: 160, unit: 'MPa', testMethod: 'ASTM B557', typical: 135 },
      { property: 'Uzama', minValue: 16, maxValue: 25, unit: '%', testMethod: 'ASTM B557', typical: 20 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 60, maxValue: 90, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 75 },
      { property: 'Deniz Suyu Korozyon Direnci', minValue: 1, maxValue: 1, unit: 'Mükemmel', testMethod: 'ASTM G44', typical: 1 },
      { property: 'Kaynak Edilebilirlik', minValue: 1, maxValue: 1, unit: 'İyi', testMethod: 'AWS D1.2', typical: 1 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 65, maxValue: 85, testPosition: 'Yüzey', typical: 75 }
    ]
  },
  
  // === TİTANYUM ALAŞIMLARI - KAPSAMLI VERİ TABANI ===
  
  // Grade 2 - ASTM B265
  {
    id: 'ti_grade2_astm_b265',
    name: 'Titanyum Grade 2 - ASTM B265',
    category: 'titanium',
    subCategory: 'ti_pure',
    grade: 'ti_grade2',
    standard: 'ASTM B265',
    chemicalComposition: [
      { element: 'Ti', minValue: 98.90, maxValue: 99.60, typical: 99.25 },
      { element: 'Fe', minValue: 0, maxValue: 0.30, typical: 0.15 },
      { element: 'O', minValue: 0, maxValue: 0.25, typical: 0.12 },
      { element: 'C', minValue: 0, maxValue: 0.10, typical: 0.05 },
      { element: 'N', minValue: 0, maxValue: 0.03, typical: 0.015 },
      { element: 'H', minValue: 0, maxValue: 0.015, typical: 0.008 }
    ],
    mechanicalProperties: [
      { property: 'Çekme Dayanımı', minValue: 345, maxValue: 480, unit: 'MPa', testMethod: 'ASTM E8', typical: 415 },
      { property: 'Akma Dayanımı', minValue: 275, maxValue: 410, unit: 'MPa', testMethod: 'ASTM E8', typical: 340 },
      { property: 'Uzama', minValue: 20, maxValue: 30, unit: '%', testMethod: 'ASTM E8', typical: 25 },
      { property: 'Çentik Darbe (Charpy V) +20°C', minValue: 25, maxValue: 50, unit: 'J', testMethod: 'ASTM E23 (+20°C)', typical: 37 },
      { property: 'Elastisite Modülü', minValue: 102, maxValue: 108, unit: 'GPa', testMethod: 'ASTM E111', typical: 105 },
      { property: 'Biyouyumluluk', minValue: 1, maxValue: 1, unit: 'Mükemmel', testMethod: 'ISO 10993', typical: 1 }
    ],
    hardnessRequirements: [
      { type: 'HB', minValue: 200, maxValue: 290, testPosition: 'Yüzey', typical: 245 }
    ]
  }
];

const MaterialCertificateTracking: React.FC = () => {
  const theme = useTheme();
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'view'>('add');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });

  // Dropdown selections
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [currentMaterialStandard, setCurrentMaterialStandard] = useState<MaterialStandard | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<MaterialRecord>>({
    materialCode: '',
    materialName: '',
    supplier: '',
    batchNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    unit: 'kg',
    standard: '',
    grade: '',
    chemicalComposition: [],
    hardnessValues: [],
    mechanicalProperties: [],
    certificates: [],
    overallStatus: 'BEKLEMEDE',
    notes: '',
    inspector: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    traceabilityNumber: ''
  });

  // Chemical composition dialog
  const [chemicalDialogOpen, setChemicalDialogOpen] = useState(false);
  const [currentChemical, setCurrentChemical] = useState<ChemicalComposition>({
    element: '',
    percentage: 0,
    specification: '',
    minValue: 0,
    maxValue: 0,
    status: 'GEÇTİ'
  });

  // Hardness dialog
  const [hardnessDialogOpen, setHardnessDialogOpen] = useState(false);
  const [currentHardness, setCurrentHardness] = useState<HardnessValue>({
    type: 'HRC',
    value: 0,
    specification: '',
    minValue: 0,
    maxValue: 0,
    testPosition: '',
    status: 'GEÇTİ'
  });

  // Mechanical properties dialog
  const [mechanicalDialogOpen, setMechanicalDialogOpen] = useState(false);
  const [currentMechanical, setCurrentMechanical] = useState<MechanicalProperty>({
    property: '',
    value: 0,
    unit: '',
    specification: '',
    minValue: 0,
    maxValue: 0,
    testMethod: '',
    status: 'GEÇTİ'
  });

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Context7 Enhanced Data Management - Safe localStorage operations
  useEffect(() => {
    try {
      const savedMaterials = localStorage.getItem('materialCertificateTracking');
      if (savedMaterials) {
        const parsedMaterials = JSON.parse(savedMaterials);
        
        // Context7 Data Validation
        if (Array.isArray(parsedMaterials)) {
          const validMaterials = parsedMaterials.filter(material => 
            material && 
            typeof material === 'object' && 
            material.id && 
            material.materialCode
          );
          
          setMaterials(validMaterials);
          
          if (validMaterials.length !== parsedMaterials.length) {
            showSnackbar(`${parsedMaterials.length - validMaterials.length} geçersiz kayıt filtrelendi.`, 'warning');
          }
        }
      }
    } catch (error) {
      console.error('Context7 - Material loading error:', error);
      showSnackbar('Malzeme verileri yüklenirken hata oluştu. Yeni başlatılıyor...', 'warning');
      setMaterials([]);
    }
  }, [showSnackbar]);

  // Context7 Enhanced Save Function
  const saveMaterials = useCallback((data: MaterialRecord[]) => {
    try {
      // Context7 Data Integrity Check
      const validMaterials = data.filter(material => 
        material && 
        material.id && 
        material.materialCode && 
        material.materialName
      );
      
      localStorage.setItem('materialCertificateTracking', JSON.stringify(validMaterials));
      setMaterials(validMaterials);
      
      // Success feedback
      if (validMaterials.length !== data.length) {
        showSnackbar(`${data.length - validMaterials.length} geçersiz kayıt filtrelendi. ${validMaterials.length} kayıt kaydedildi.`, 'warning');
      }
      
    } catch (error) {
      console.error('Context7 - Material saving error:', error);
      showSnackbar('Veri kaydetme hatası! Lütfen tekrar deneyin.', 'error');
    }
  }, [showSnackbar]);

  // Generate ID
  const generateId = () => `MCT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Malzeme adından standart bilgisini kaldır (sadece malzeme cinsini göster)
  const getCleanMaterialName = (materialName: string): string => {
    // " - " ile ayrılmış standart kısmını kaldır
    if (materialName.includes(' - ')) {
      return materialName.split(' - ')[0];
    }
    // Alternatif ayırıcıları kontrol et
    if (materialName.includes(' (') && materialName.includes(')')) {
      return materialName.split(' (')[0];
    }
    // Eğer ayırıcı yoksa orijinal ismi döndür
    return materialName;
  };

  // Durum adlarını kısalt
  const getShortStatusLabel = (status: string): string => {
    switch (status) {
      case 'ONAYLANMIS':
        return 'ONAY';
      case 'REDDEDİLDİ':
        return 'RED';
      case 'BEKLEMEDE':
        return 'BEKLER';
      case 'ŞARTLI':
        return 'ŞARTLI';
      default:
        return status;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONAYLANMIS': case 'GEÇTİ': return 'success';
      case 'REDDEDİLDİ': case 'KALDI': return 'error';
      case 'ŞARTLI': case 'UYARI': return 'warning';
      case 'BEKLEMEDE': return 'info';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONAYLANMIS': case 'GEÇTİ': return <CheckIcon />;
      case 'REDDEDİLDİ': case 'KALDI': return <CancelIcon />;
      case 'ŞARTLI': case 'UYARI': return <WarningIcon />;
      case 'BEKLEMEDE': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  // Get typical values for properties
  const getTypicalValuesForProperty = (property: string) => {
    const defaults = {
      unit: '',
      testMethod: '',
      minValue: 0,
      maxValue: 999
    };

    switch (property) {
      case 'Çentik Darbe (Charpy V) +20°C':
        return { unit: 'J', testMethod: 'ISO 148-1 (+20°C)', minValue: 27, maxValue: 300 };
      case 'Çentik Darbe (Charpy V) 0°C':
        return { unit: 'J', testMethod: 'ISO 148-1 (0°C)', minValue: 22, maxValue: 250 };
      case 'Çentik Darbe (Charpy V) -20°C':
        return { unit: 'J', testMethod: 'ISO 148-1 (-20°C)', minValue: 18, maxValue: 200 };
      case 'Çentik Darbe (Charpy V) -40°C':
        return { unit: 'J', testMethod: 'ISO 148-1 (-40°C)', minValue: 12, maxValue: 150 };
      case 'Çentik Darbe (Charpy V) -54°C':
        return { unit: 'J', testMethod: 'ISO 148-1 (-54°C)', minValue: 8, maxValue: 100 };
      case 'Çentik Darbe (Charpy V) -196°C':
        return { unit: 'J', testMethod: 'ISO 148-1 (-196°C)', minValue: 5, maxValue: 80 };
      case 'Çentik Darbe (Izod) +20°C':
        return { unit: 'J', testMethod: 'ASTM D256 (+20°C)', minValue: 20, maxValue: 250 };
      case 'Çentik Darbe (Izod) -20°C':
        return { unit: 'J', testMethod: 'ASTM D256 (-20°C)', minValue: 15, maxValue: 200 };
      case 'Çekme Dayanımı':
        return { unit: 'MPa', testMethod: 'ISO 6892-1', minValue: 200, maxValue: 2500 };
      case 'Akma Dayanımı':
        return { unit: 'MPa', testMethod: 'ISO 6892-1', minValue: 150, maxValue: 2000 };
      case 'Uzama':
        return { unit: '%', testMethod: 'ISO 6892-1', minValue: 5, maxValue: 60 };
      case 'Elastisite Modülü':
        return { unit: 'GPa', testMethod: 'ISO 6892-1', minValue: 50, maxValue: 350 };
      case 'Yorulma Dayanımı':
        return { unit: 'MPa', testMethod: 'ISO 1099', minValue: 50, maxValue: 800 };
      case 'Kırılma Tokluğu':
        return { unit: 'MPa√m', testMethod: 'ASTM E399', minValue: 10, maxValue: 200 };
      case 'Aşınma Direnci':
        return { unit: 'HV', testMethod: 'ASTM G99', minValue: 100, maxValue: 1000 };
      case 'Korozyon Direnci':
        return { unit: 'saat', testMethod: 'ASTM A262', minValue: 12, maxValue: 999 };
      case 'Sıkışma Dayanımı':
        return { unit: 'MPa', testMethod: 'ISO 604', minValue: 500, maxValue: 5000 };
      default:
        return defaults;
    }
  };

  // Get typical hardness values
  const getTypicalHardnessValues = (hardnessType: string) => {
    const defaults = {
      testPosition: 'Yüzey',
      minValue: 0,
      maxValue: 999
    };

    switch (hardnessType) {
      case 'HRC':
        return { testPosition: 'Yüzey', minValue: 20, maxValue: 65 };
      case 'HRB':
        return { testPosition: 'Yüzey', minValue: 60, maxValue: 100 };
      case 'HV':
        return { testPosition: 'Yüzey', minValue: 150, maxValue: 800 };
      case 'HB':
        return { testPosition: 'Yüzey', minValue: 100, maxValue: 500 };
      case 'Shore A':
        return { testPosition: 'Yüzey', minValue: 20, maxValue: 95 };
      case 'Shore D':
        return { testPosition: 'Yüzey', minValue: 30, maxValue: 85 };
      default:
        return defaults;
    }
  };

  // Get typical element values
  const getTypicalElementValues = (element: string) => {
    const defaults = {
      minValue: 0,
      maxValue: 0.1
    };

    switch (element) {
      case 'C':
        return { minValue: 0, maxValue: 1.5 };
      case 'Si':
        return { minValue: 0, maxValue: 2.0 };
      case 'Mn':
        return { minValue: 0, maxValue: 2.0 };
      case 'P':
        return { minValue: 0, maxValue: 0.045 };
      case 'S':
        return { minValue: 0, maxValue: 0.045 };
      case 'Cr':
        return { minValue: 0, maxValue: 25.0 };
      case 'Ni':
        return { minValue: 0, maxValue: 20.0 };
      case 'Mo':
        return { minValue: 0, maxValue: 5.0 };
      case 'V':
        return { minValue: 0, maxValue: 2.0 };
      case 'Ti':
        return { minValue: 0, maxValue: 1.0 };
      case 'Al':
        return { minValue: 0, maxValue: 10.0 };
      case 'Cu':
        return { minValue: 0, maxValue: 5.0 };
      case 'Nb':
        return { minValue: 0, maxValue: 1.0 };
      case 'W':
        return { minValue: 0, maxValue: 5.0 };
      case 'Co':
        return { minValue: 0, maxValue: 15.0 };
      case 'Fe':
        return { minValue: 85.0, maxValue: 99.0 };
      case 'Zn':
        return { minValue: 0, maxValue: 7.0 };
      case 'Mg':
        return { minValue: 0, maxValue: 5.0 };
      case 'O':
        return { minValue: 0, maxValue: 0.25 };
      case 'N':
        return { minValue: 0, maxValue: 0.15 };
      case 'H':
        return { minValue: 0, maxValue: 0.02 };
      default:
        return defaults;
    }
  };

  // Evaluate chemical composition status
  const evaluateChemicalStatus = (composition: ChemicalComposition): 'GEÇTİ' | 'KALDI' | 'UYARI' => {
    const { percentage, minValue, maxValue } = composition;
    if (percentage < minValue || percentage > maxValue) return 'KALDI';
    if (percentage <= minValue * 1.1 || percentage >= maxValue * 0.9) return 'UYARI';
    return 'GEÇTİ';
  };

  // Evaluate hardness status
  const evaluateHardnessStatus = (hardness: HardnessValue): 'GEÇTİ' | 'KALDI' | 'UYARI' => {
    const { value, minValue, maxValue } = hardness;
    if (value < minValue || value > maxValue) return 'KALDI';
    if (value <= minValue * 1.05 || value >= maxValue * 0.95) return 'UYARI';
    return 'GEÇTİ';
  };

  // Evaluate mechanical property status
  const evaluateMechanicalStatus = (mechanical: MechanicalProperty): 'GEÇTİ' | 'KALDI' | 'UYARI' => {
    const { value, minValue, maxValue } = mechanical;
    if (value < minValue || value > maxValue) return 'KALDI';
    if (value <= minValue * 1.05 || value >= maxValue * 0.95) return 'UYARI';
    return 'GEÇTİ';
  };

  // Context7 Enhanced - Calculate overall status with dynamic evaluation
  const calculateOverallStatus = (material: Partial<MaterialRecord>): 'ONAYLANMIS' | 'REDDEDİLDİ' | 'BEKLEMEDE' | 'ŞARTLI' => {
    const { chemicalComposition = [], hardnessValues = [], mechanicalProperties = [] } = material;
    
    const allTests = [
      ...chemicalComposition.map(c => c.status),
      ...hardnessValues.map(h => h.status),
      ...mechanicalProperties.map(m => m.status)
    ];

    // Context7 Dynamic Status Logic
    if (allTests.includes('KALDI')) return 'REDDEDİLDİ';
    if (allTests.includes('BEKLEMEDE') || allTests.length === 0) return 'BEKLEMEDE';
    if (allTests.includes('UYARI')) return 'ŞARTLI';
    return 'ONAYLANMIS';
  };

  // Handle add/edit material
  const handleSaveMaterial = () => {
    if (!formData.materialCode || !formData.materialName) {
      showSnackbar('Malzeme kodu ve adı zorunludur', 'error');
      return;
    }

    const traceabilityNumber = formData.traceabilityNumber || `TR-${Date.now()}`;
    const overallStatus = calculateOverallStatus(formData);

    const materialData: MaterialRecord = {
      id: formData.id || generateId(),
      materialCode: formData.materialCode!,
      materialName: formData.materialName!,
      supplier: formData.supplier || '',
      batchNumber: formData.batchNumber || '',
      receivedDate: formData.receivedDate!,
      quantity: formData.quantity || 0,
      unit: formData.unit || 'kg',
      standard: formData.standard || '',
      grade: formData.grade || '',
      chemicalComposition: formData.chemicalComposition || [],
      hardnessValues: formData.hardnessValues || [],
      mechanicalProperties: formData.mechanicalProperties || [],
      certificates: formData.certificates || [],
      overallStatus,
      notes: formData.notes || '',
      inspector: formData.inspector || '',
      inspectionDate: formData.inspectionDate!,
      traceabilityNumber
    };

    let updatedMaterials;
    if (dialogType === 'edit') {
      updatedMaterials = materials.map(m => m.id === materialData.id ? materialData : m);
      showSnackbar('Malzeme kaydı güncellendi', 'success');
    } else {
      updatedMaterials = [...materials, materialData];
      showSnackbar('Yeni malzeme kaydı eklendi', 'success');
    }

    saveMaterials(updatedMaterials);
    setDialogOpen(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      materialCode: '',
      materialName: '',
      supplier: '',
      batchNumber: '',
      receivedDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      unit: 'kg',
      standard: '',
      grade: '',
      chemicalComposition: [],
      hardnessValues: [],
      mechanicalProperties: [],
      certificates: [],
      overallStatus: 'BEKLEMEDE',
      notes: '',
      inspector: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      traceabilityNumber: ''
    });
    
    // Reset dropdown selections
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedGrade('');
    setSelectedStandard('');
    setCurrentMaterialStandard(null);
  };

  // Handle delete material
  const handleDeleteMaterial = (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Bu malzeme kaydını silmek istediğinizden emin misiniz?')) {
      const updatedMaterials = materials.filter(m => m.id !== id);
      saveMaterials(updatedMaterials);
      showSnackbar('Malzeme kaydı silindi', 'success');
    }
  };

  // Handle add chemical composition
  const handleAddChemical = () => {
    if (!currentChemical.element) {
      showSnackbar('Element adı zorunludur', 'error');
      return;
    }

    const status = evaluateChemicalStatus(currentChemical);
    const chemical = { ...currentChemical, status };
    
    const updatedComposition = [...(formData.chemicalComposition || []), chemical];
    setFormData(prev => ({ ...prev, chemicalComposition: updatedComposition }));
    setChemicalDialogOpen(false);
    setCurrentChemical({
      element: '',
      percentage: 0,
      specification: '',
      minValue: 0,
      maxValue: 0,
      status: 'GEÇTİ'
    });
  };

  // Handle add hardness value
  const handleAddHardness = () => {
    if (!currentHardness.type) {
      showSnackbar('Sertlik tipi zorunludur', 'error');
      return;
    }

    const status = evaluateHardnessStatus(currentHardness);
    const hardness = { ...currentHardness, status };
    
    const updatedHardness = [...(formData.hardnessValues || []), hardness];
    setFormData(prev => ({ ...prev, hardnessValues: updatedHardness }));
    setHardnessDialogOpen(false);
    setCurrentHardness({
      type: 'HRC',
      value: 0,
      specification: '',
      minValue: 0,
      maxValue: 0,
      testPosition: '',
      status: 'GEÇTİ'
    });
  };

  // Handle add mechanical property
  const handleAddMechanical = () => {
    if (!currentMechanical.property) {
      showSnackbar('Özellik adı zorunludur', 'error');
      return;
    }

    const status = evaluateMechanicalStatus(currentMechanical);
    const mechanical = { ...currentMechanical, status };
    
    const updatedMechanical = [...(formData.mechanicalProperties || []), mechanical];
    setFormData(prev => ({ ...prev, mechanicalProperties: updatedMechanical }));
    setMechanicalDialogOpen(false);
    setCurrentMechanical({
      property: '',
      value: 0,
      unit: '',
      specification: '',
      minValue: 0,
      maxValue: 0,
      testMethod: '',
      status: 'GEÇTİ'
    });
  };

  // Dropdown handlers
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setSelectedGrade('');
    setSelectedStandard('');
    setCurrentMaterialStandard(null);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setSelectedGrade('');
    setSelectedStandard('');
    setCurrentMaterialStandard(null);
  };

  const handleGradeChange = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setSelectedStandard('');
    setCurrentMaterialStandard(null);
  };

  const handleStandardChange = (standardName: string) => {
    setSelectedStandard(standardName);
    
    // Find the material standard based on selected grade id and standard name
    const standard = materialStandards.find(
      s => s.grade === selectedGrade && s.standard === standardName
    );
    
    if (standard) {
      setCurrentMaterialStandard(standard);
      
      // Auto-fill form data
      setFormData(prev => ({
        ...prev,
        standard: standardName,
        grade: standard.grade.toUpperCase(),
        materialName: prev.materialName || standard.grade.toUpperCase()
      }));
      
      showSnackbar('Standart bilgileri yüklendi. Artık test değerlerini girebilirsiniz.', 'success');
    }
  };

  // Context7 Enhanced - Load only specifications without measured values
  const loadSpecifications = () => {
    if (!currentMaterialStandard) {
      showSnackbar('Önce malzeme standardını seçin', 'warning');
      return;
    }

    try {
      // Context7 Safe Data Loading - Only load specifications, no measured values
      
      // Load chemical composition specifications only
      const chemicalSpecs = currentMaterialStandard.chemicalComposition.map(comp => ({
        element: comp.element,
        percentage: 0, // User will enter actual measured value
        specification: currentMaterialStandard.standard,
        minValue: comp.minValue,
        maxValue: comp.maxValue,
        status: 'BEKLEMEDE' as const // Will be calculated dynamically when user enters value
      }));

      // Load mechanical properties specifications only
      const mechanicalSpecs = currentMaterialStandard.mechanicalProperties.map(prop => ({
        property: prop.property,
        value: 0, // User will enter actual measured value
        unit: prop.unit,
        specification: currentMaterialStandard.standard,
        minValue: prop.minValue,
        maxValue: prop.maxValue,
        testMethod: prop.testMethod,
        status: 'BEKLEMEDE' as const // Will be calculated dynamically when user enters value
      }));

      // Load hardness requirements specifications only
      const hardnessSpecs = currentMaterialStandard.hardnessRequirements.map(hard => ({
        type: hard.type,
        value: 0, // User will enter actual measured value
        specification: currentMaterialStandard.standard,
        minValue: hard.minValue,
        maxValue: hard.maxValue,
        testPosition: hard.testPosition,
        status: 'BEKLEMEDE' as const // Will be calculated dynamically when user enters value
      }));

      // Context7 Safe Form Update
      setFormData(prev => ({
        ...prev,
        chemicalComposition: chemicalSpecs,
        mechanicalProperties: mechanicalSpecs,
        hardnessValues: hardnessSpecs
      }));

      showSnackbar(`${currentMaterialStandard.name} için spesifikasyonlar yüklendi. ${chemicalSpecs.length} kimyasal element, ${mechanicalSpecs.length} mekanik özellik, ${hardnessSpecs.length} sertlik testi. Şimdi ölçülen değerleri girebilirsiniz.`, 'success');
      
    } catch (error) {
      showSnackbar('Spesifikasyon yüklenirken hata oluştu. Lütfen tekrar deneyin.', 'error');
      console.error('Specification loading error:', error);
    }
  };

  // Enhanced auto-integration function - Context7
  const handleAutoIntegration = () => {
    if (!currentMaterialStandard) {
      showSnackbar('Otomatik entegrasyon için önce malzeme kategorisi, alt kategori, kalite ve standart seçin.', 'error');
      return;
    }

    // Context7 Safe Integration
    try {
      // Kimyasal bileşim verilerini yükle
      const chemicalSpecs = currentMaterialStandard.chemicalComposition.map(comp => ({
        element: comp.element,
        percentage: comp.typical || ((comp.minValue + comp.maxValue) / 2),
        specification: currentMaterialStandard.standard,
        minValue: comp.minValue,
        maxValue: comp.maxValue,
        status: 'GEÇTİ' as const
      }));

      // Mekanik özellik verilerini yükle
      const mechanicalSpecs = currentMaterialStandard.mechanicalProperties.map(prop => ({
        property: prop.property,
        value: prop.typical || ((prop.minValue + prop.maxValue) / 2),
        unit: prop.unit,
        specification: currentMaterialStandard.standard,
        minValue: prop.minValue,
        maxValue: prop.maxValue,
        testMethod: prop.testMethod,
        status: 'GEÇTİ' as const
      }));

      // Sertlik değerlerini yükle
      const hardnessSpecs = currentMaterialStandard.hardnessRequirements.map(hard => ({
        type: hard.type,
        value: hard.typical || ((hard.minValue + hard.maxValue) / 2),
        specification: currentMaterialStandard.standard,
        minValue: hard.minValue,
        maxValue: hard.maxValue,
        testPosition: hard.testPosition,
        status: 'GEÇTİ' as const
      }));
      
      // Form verilerini güncelle - tüm tablolar doldurulacak
      setFormData(prev => ({
        ...prev,
        materialName: prev.materialName || currentMaterialStandard.grade.toUpperCase(),
        grade: currentMaterialStandard.grade.toUpperCase(),
        standard: currentMaterialStandard.standard,
        inspector: 'Otomatik Sistem',
        inspectionDate: new Date().toISOString().split('T')[0],
        // TABLOLARI DOLDUR
        chemicalComposition: chemicalSpecs,
        mechanicalProperties: mechanicalSpecs,
        hardnessValues: hardnessSpecs
      }));

      showSnackbar(`Otomatik entegrasyon tamamlandı. ${chemicalSpecs.length} kimyasal element, ${mechanicalSpecs.length} mekanik özellik, ${hardnessSpecs.length} sertlik değeri tablolara yüklendi.`, 'success');
      
    } catch (error) {
      showSnackbar('Otomatik entegrasyon sırasında hata oluştu. Lütfen tekrar deneyin.', 'error');
      console.error('Auto integration error:', error);
    }
  };

  // Get available options for dropdowns
  const getSubCategories = () => {
    if (!selectedCategory) return [];
    const category = materialCategories.find(cat => cat.id === selectedCategory);
    return category?.subCategories || [];
  };

  const getGrades = () => {
    if (!selectedCategory || !selectedSubCategory) return [];
    const category = materialCategories.find(cat => cat.id === selectedCategory);
    const subCategory = category?.subCategories.find(sub => sub.id === selectedSubCategory);
    return subCategory?.grades || [];
  };

  const getStandards = () => {
    if (!selectedGrade) return [];
    const grade = getGrades().find(g => g.id === selectedGrade);
    return grade?.standards || [];
  };

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || material.overallStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get statistics
  const stats = {
    total: materials.length,
    approved: materials.filter(m => m.overallStatus === 'ONAYLANMIS').length,
    rejected: materials.filter(m => m.overallStatus === 'REDDEDİLDİ').length,
    pending: materials.filter(m => m.overallStatus === 'BEKLEMEDE').length,
    conditional: materials.filter(m => m.overallStatus === 'ŞARTLI').length
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white', flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
            <Typography variant="body2">Toplam Kayıt</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.success.main, color: 'white', flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.approved}</Typography>
            <Typography variant="body2">Onaylı</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.error.main, color: 'white', flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.rejected}</Typography>
            <Typography variant="body2">Reddedilen</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white', flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.conditional}</Typography>
            <Typography variant="body2">Şartlı Onay</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.info.main, color: 'white', flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
            <Typography variant="body2">Beklemede</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ara... (Kod, Ad, Tedarikçi)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
          <Box sx={{ flex: '0 0 200px', minWidth: 200 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum Filtresi</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Durum Filtresi"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="ONAYLANMIS">Onaylı</MenuItem>
                <MenuItem value="REDDEDİLDİ">Reddedilen</MenuItem>
                <MenuItem value="ŞARTLI">Şartlı Onay</MenuItem>
                <MenuItem value="BEKLEMEDE">Beklemede</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogType('add');
                resetForm();
                setDialogOpen(true);
              }}
            >
              Yeni Malzeme
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => showSnackbar('Rapor yazdırılıyor...', 'info')}
            >
              Rapor Al
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Materials Table */}
      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
                              <TableRow sx={{ bgcolor: 'primary.50' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '110px' }}>
                    Malzeme Kodu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '160px' }}>
                    Malzeme Adı
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>
                    Tedarikçi
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '110px' }}>
                    Parti No
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>
                    Giriş Tarihi
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>
                    Durum
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '160px' }}>
                    İzlenebilirlik No
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '90px', textAlign: 'center' }}>
                    İşlemler
                  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    fontSize: '0.875rem',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {material.materialCode}
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.875rem',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {getCleanMaterialName(material.materialName)}
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.875rem',
                    maxWidth: '140px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {material.supplier}
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.875rem',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {material.batchNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {new Date(material.receivedDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(material.overallStatus)}
                      label={getShortStatusLabel(material.overallStatus)}
                      color={getStatusColor(material.overallStatus) as any}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22, minWidth: '60px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {material.traceabilityNumber}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                        sx={{ 
                          color: 'info.main',
                          '&:hover': { bgcolor: 'info.50' }
                        }}
                      onClick={() => {
                        setFormData(material);
                        setDialogType('view');
                        setDialogOpen(true);
                      }}
                    >
                        <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                        sx={{ 
                          color: 'warning.main',
                          '&:hover': { bgcolor: 'warning.50' }
                        }}
                      onClick={() => {
                        setFormData(material);
                        setDialogType('edit');
                        setDialogOpen(true);
                      }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                        sx={{ 
                          color: 'error.main',
                          '&:hover': { bgcolor: 'error.50' }
                        }}
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Material Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Yeni Malzeme Kaydı' : 
           dialogType === 'edit' ? 'Malzeme Kaydını Düzenle' : 'Malzeme Detayları'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Genel Bilgiler" />
              <Tab label="Kimyasal Bileşim" />
              <Tab label="Sertlik Değerleri" />
              <Tab label="Mekanik Özellikler" />
              <Tab label="Sertifikalar" />
            </Tabs>

            {/* General Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Material Selection Section */}
                {dialogType !== 'view' && (
                  <Box sx={{ 
                    border: '2px solid',
                    borderColor: theme.palette.primary.main,
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    bgcolor: 'primary.50'
                  }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Malzeme Türü ve Standart Seçimi
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>OTOMATIK ENTEGRASYON SİSTEMİ:</strong> Malzeme kategorisi → Alt kategori → Kalite → Standart seçin.
                      Sistem kimyasal bileşim, sertlik değerleri ve mekanik özellikler için tüm spesifikasyonları otomatik yükler.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <FormControl fullWidth>
                            <InputLabel>1. Malzeme Kategorisi</InputLabel>
                            <Select
                              value={selectedCategory}
                              onChange={(e) => handleCategoryChange(e.target.value)}
                              label="1. Malzeme Kategorisi"
                              sx={{ bgcolor: selectedCategory ? 'success.50' : 'background.paper' }}
                            >
                              {materialCategories.map(category => (
                                <MenuItem key={category.id} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <FormControl fullWidth disabled={!selectedCategory}>
                            <InputLabel>2. Alt Kategori</InputLabel>
                            <Select
                              value={selectedSubCategory}
                              onChange={(e) => handleSubCategoryChange(e.target.value)}
                              label="2. Alt Kategori"
                              sx={{ bgcolor: selectedSubCategory ? 'success.50' : 'background.paper' }}
                            >
                              {getSubCategories().map(subCategory => (
                                <MenuItem key={subCategory.id} value={subCategory.id}>
                                  {subCategory.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <FormControl fullWidth disabled={!selectedSubCategory}>
                            <InputLabel>3. Malzeme Kalitesi</InputLabel>
                            <Select
                              value={selectedGrade}
                              onChange={(e) => handleGradeChange(e.target.value)}
                              label="3. Malzeme Kalitesi"
                              sx={{ bgcolor: selectedGrade ? 'success.50' : 'background.paper' }}
                            >
                              {getGrades().map(grade => (
                                <MenuItem key={grade.id} value={grade.id}>
                                  {grade.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <FormControl fullWidth disabled={!selectedGrade}>
                            <InputLabel>4. Standart</InputLabel>
                            <Select
                              value={selectedStandard}
                              onChange={(e) => handleStandardChange(e.target.value)}
                              label="4. Standart"
                              sx={{ bgcolor: selectedStandard ? 'success.50' : 'background.paper' }}
                            >
                              {getStandards().map(standard => (
                                <MenuItem key={standard} value={standard}>
                                  {standard}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                      
                      {currentMaterialStandard && (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 2, 
                          mt: 2,
                          p: 2,
                          bgcolor: 'success.50',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'success.main'
                        }}>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                            Standart Hazır: {currentMaterialStandard.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              onClick={handleAutoIntegration}
                              startIcon={<DownloadIcon />}
                              sx={{ 
                                minWidth: 250,
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                              }}
                            >
                              OTOMATIK ENTEGRE ET
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={loadSpecifications}
                              startIcon={<DownloadIcon />}
                            >
                              Sadece Spesifikasyonları Yükle
                            </Button>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: '0.875rem' }}>
                            <Typography variant="caption">
                              {currentMaterialStandard.chemicalComposition.length} Kimyasal Element
                            </Typography>
                            <Typography variant="caption">
                              {currentMaterialStandard.mechanicalProperties.length} Mekanik Test
                            </Typography>
                            <Typography variant="caption">
                              {currentMaterialStandard.hardnessRequirements.length} Sertlik Testi
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Basic Information */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Malzeme Kodu"
                      value={formData.materialCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, materialCode: e.target.value }))}
                      disabled={dialogType === 'view'}
                      required
                      helperText="Örn: SM001, ALU001"
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Malzeme Adı"
                      value={formData.materialName}
                      onChange={(e) => setFormData(prev => ({ ...prev, materialName: e.target.value }))}
                      disabled={dialogType === 'view'}
                      required
                      helperText={currentMaterialStandard ? "Otomatik dolduruldu" : "Manuel giriş"}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Tedarikçi"
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      disabled={dialogType === 'view'}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Parti/Lot Numarası"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                      disabled={dialogType === 'view'}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Giriş Tarihi"
                      type="date"
                      value={formData.receivedDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                      disabled={dialogType === 'view'}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Miktar"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      disabled={dialogType === 'view'}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <FormControl fullWidth>
                      <InputLabel>Birim</InputLabel>
                      <Select
                        value={formData.unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        disabled={dialogType === 'view'}
                        label="Birim"
                      >
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="ton">ton</MenuItem>
                        <MenuItem value="adet">adet</MenuItem>
                        <MenuItem value="m">m</MenuItem>
                        <MenuItem value="m2">m²</MenuItem>
                        <MenuItem value="m3">m³</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Standart"
                      value={formData.standard}
                      onChange={(e) => setFormData(prev => ({ ...prev, standard: e.target.value }))}
                      disabled={dialogType === 'view' || !!currentMaterialStandard}
                      placeholder="örn: DIN EN 10025-2"
                      helperText={currentMaterialStandard ? "Otomatik seçildi" : "Manuel giriş veya yukarıdan seçin"}
                      InputProps={{
                        startAdornment: currentMaterialStandard && <CheckIcon color="success" sx={{ mr: 1 }} />
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Kalite/Grade"
                      value={formData.grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      disabled={dialogType === 'view' || !!currentMaterialStandard}
                      placeholder="örn: S355J2"
                      helperText={currentMaterialStandard ? "Otomatik seçildi" : "Manuel giriş veya yukarıdan seçin"}
                      InputProps={{
                        startAdornment: currentMaterialStandard && <CheckIcon color="success" sx={{ mr: 1 }} />
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Kontrol Eden"
                      value={formData.inspector}
                      onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))}
                      disabled={dialogType === 'view'}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="Kontrol Tarihi"
                      type="date"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                      disabled={dialogType === 'view'}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <TextField
                      fullWidth
                      label="İzlenebilirlik Numarası"
                      value={formData.traceabilityNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, traceabilityNumber: e.target.value }))}
                      disabled={dialogType === 'view'}
                      placeholder="Otomatik oluşturulur"
                    />
                  </Box>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Notlar"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={dialogType === 'view'}
                  />
                </Box>
              </Box>
            </TabPanel>

            {/* Chemical Composition Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setChemicalDialogOpen(true)}
                  disabled={dialogType === 'view'}
                >
                  Element Ekle
                </Button>
                {currentMaterialStandard && dialogType !== 'view' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      // Load only chemical composition
                      const chemicalSpecs = currentMaterialStandard.chemicalComposition.map(comp => ({
                        element: comp.element,
                        percentage: comp.typical || ((comp.minValue + comp.maxValue) / 2),
                        specification: currentMaterialStandard.standard,
                        minValue: comp.minValue,
                        maxValue: comp.maxValue,
                        status: 'GEÇTİ' as const
                      }));
                      setFormData(prev => ({ ...prev, chemicalComposition: chemicalSpecs }));
                      showSnackbar('Kimyasal bileşim şablonu yüklendi', 'success');
                    }}
                  >
                    Standart Şablonu Yükle
                  </Button>
                )}
                {formData.chemicalComposition && formData.chemicalComposition.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.chemicalComposition.length} element tanımlı
                  </Typography>
                )}
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Element</TableCell>
                      <TableCell>Ölçülen (%)</TableCell>
                      <TableCell>Spesifikasyon</TableCell>
                      <TableCell>Min (%)</TableCell>
                      <TableCell>Max (%)</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.chemicalComposition?.map((comp, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{comp.element}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={comp.percentage}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0;
                              const updated = [...(formData.chemicalComposition || [])];
                              // Context7 Dynamic Status Calculation
                              const newStatus = newValue === 0 ? 'BEKLEMEDE' : 
                                newValue >= comp.minValue && newValue <= comp.maxValue ? 'GEÇTİ' : 
                                newValue < comp.minValue * 0.95 || newValue > comp.maxValue * 1.05 ? 'KALDI' : 'UYARI';
                              updated[index] = { ...comp, percentage: newValue, status: newStatus };
                              setFormData(prev => ({ ...prev, chemicalComposition: updated }));
                            }}
                            disabled={dialogType === 'view'}
                            inputProps={{ step: 0.001, min: 0 }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>{comp.specification}</TableCell>
                        <TableCell>{comp.minValue}</TableCell>
                        <TableCell>{comp.maxValue}</TableCell>
                        <TableCell>
                          <Chip
                            label={comp.status}
                            color={getStatusColor(comp.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setCurrentChemical(comp);
                                setChemicalDialogOpen(true);
                              }}
                              disabled={dialogType === 'view'}
                              title="Düzenle"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated = formData.chemicalComposition?.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, chemicalComposition: updated }));
                              }}
                              disabled={dialogType === 'view'}
                              title="Sil"
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
            </TabPanel>

            {/* Hardness Values Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setHardnessDialogOpen(true)}
                  disabled={dialogType === 'view'}
                >
                  Sertlik Değeri Ekle
                </Button>
                {currentMaterialStandard && dialogType !== 'view' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      // Load only hardness requirements
                      const hardnessSpecs = currentMaterialStandard.hardnessRequirements.map(hard => ({
                        type: hard.type,
                        value: hard.typical || ((hard.minValue + hard.maxValue) / 2),
                        specification: currentMaterialStandard.standard,
                        minValue: hard.minValue,
                        maxValue: hard.maxValue,
                        testPosition: hard.testPosition,
                        status: 'GEÇTİ' as const
                      }));
                      setFormData(prev => ({ ...prev, hardnessValues: hardnessSpecs }));
                      showSnackbar('Sertlik değerleri şablonu yüklendi', 'success');
                    }}
                  >
                    Standart Şablonu Yükle
                  </Button>
                )}
                {formData.hardnessValues && formData.hardnessValues.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.hardnessValues.length} sertlik testi tanımlı
                  </Typography>
                )}
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tip</TableCell>
                      <TableCell>Değer</TableCell>
                      <TableCell>Spesifikasyon</TableCell>
                      <TableCell>Min</TableCell>
                      <TableCell>Max</TableCell>
                      <TableCell>Test Pozisyonu</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.hardnessValues?.map((hardness, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{hardness.type}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={hardness.value}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0;
                              const updated = [...(formData.hardnessValues || [])];
                              // Context7 Dynamic Status Calculation
                              const newStatus = newValue === 0 ? 'BEKLEMEDE' : 
                                newValue >= hardness.minValue && newValue <= hardness.maxValue ? 'GEÇTİ' : 
                                newValue < hardness.minValue * 0.9 || newValue > hardness.maxValue * 1.1 ? 'KALDI' : 'UYARI';
                              updated[index] = { ...hardness, value: newValue, status: newStatus };
                              setFormData(prev => ({ ...prev, hardnessValues: updated }));
                            }}
                            disabled={dialogType === 'view'}
                            inputProps={{ step: 0.1, min: 0 }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>{hardness.specification}</TableCell>
                        <TableCell>{hardness.minValue}</TableCell>
                        <TableCell>{hardness.maxValue}</TableCell>
                        <TableCell>{hardness.testPosition}</TableCell>
                        <TableCell>
                          <Chip
                            label={hardness.status}
                            color={getStatusColor(hardness.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setCurrentHardness(hardness);
                                setHardnessDialogOpen(true);
                              }}
                              disabled={dialogType === 'view'}
                              title="Düzenle"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated = formData.hardnessValues?.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, hardnessValues: updated }));
                              }}
                              disabled={dialogType === 'view'}
                              title="Sil"
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
            </TabPanel>

            {/* Mechanical Properties Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setMechanicalDialogOpen(true)}
                  disabled={dialogType === 'view'}
                >
                  Mekanik Özellik Ekle
                </Button>
                {currentMaterialStandard && dialogType !== 'view' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      // Load only mechanical properties
                      const mechanicalSpecs = currentMaterialStandard.mechanicalProperties.map(prop => ({
                        property: prop.property,
                        value: prop.typical || ((prop.minValue + prop.maxValue) / 2),
                        unit: prop.unit,
                        specification: currentMaterialStandard.standard,
                        minValue: prop.minValue,
                        maxValue: prop.maxValue,
                        testMethod: prop.testMethod,
                        status: 'GEÇTİ' as const
                      }));
                      setFormData(prev => ({ ...prev, mechanicalProperties: mechanicalSpecs }));
                      showSnackbar('Mekanik özellikler şablonu yüklendi', 'success');
                    }}
                  >
                    Standart Şablonu Yükle
                  </Button>
                )}
                {formData.mechanicalProperties && formData.mechanicalProperties.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.mechanicalProperties.length} mekanik test tanımlı
                  </Typography>
                )}
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Özellik</TableCell>
                      <TableCell>Değer</TableCell>
                      <TableCell>Birim</TableCell>
                      <TableCell>Spesifikasyon</TableCell>
                      <TableCell>Min</TableCell>
                      <TableCell>Max</TableCell>
                      <TableCell>Test Metodu</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.mechanicalProperties?.map((mechanical, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{mechanical.property}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={mechanical.value}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0;
                              const updated = [...(formData.mechanicalProperties || [])];
                              // Context7 Dynamic Status Calculation
                              const newStatus = newValue === 0 ? 'BEKLEMEDE' : 
                                newValue >= mechanical.minValue && newValue <= mechanical.maxValue ? 'GEÇTİ' : 
                                newValue < mechanical.minValue * 0.9 || newValue > mechanical.maxValue * 1.1 ? 'KALDI' : 'UYARI';
                              updated[index] = { ...mechanical, value: newValue, status: newStatus };
                              setFormData(prev => ({ ...prev, mechanicalProperties: updated }));
                            }}
                            disabled={dialogType === 'view'}
                            inputProps={{ step: 0.1, min: 0 }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>{mechanical.unit}</TableCell>
                        <TableCell>{mechanical.specification}</TableCell>
                        <TableCell>{mechanical.minValue}</TableCell>
                        <TableCell>{mechanical.maxValue}</TableCell>
                        <TableCell>{mechanical.testMethod}</TableCell>
                        <TableCell>
                          <Chip
                            label={mechanical.status}
                            color={getStatusColor(mechanical.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setCurrentMechanical(mechanical);
                                setMechanicalDialogOpen(true);
                              }}
                              disabled={dialogType === 'view'}
                              title="Düzenle"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated = formData.mechanicalProperties?.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, mechanicalProperties: updated }));
                              }}
                              disabled={dialogType === 'view'}
                              title="Sil"
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
            </TabPanel>

            {/* Certificates Tab */}
            <TabPanel value={tabValue} index={4}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  disabled={dialogType === 'view'}
                  onClick={() => showSnackbar('Sertifika yükleme özelliği geliştirilecek', 'info')}
                >
                  Sertifika Yükle
                </Button>
              </Box>
              <List>
                {formData.certificates?.map((cert, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CertificateIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={cert.fileName}
                      secondary={`Yükleme tarihi: ${new Date(cert.uploadDate).toLocaleDateString('tr-TR')}`}
                    />
                    <IconButton onClick={() => showSnackbar('Dosya indiriliyor...', 'info')}>
                      <DownloadIcon />
                    </IconButton>
                  </ListItem>
                ))}
                {(!formData.certificates || formData.certificates.length === 0) && (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    Henüz sertifika yüklenmemiş
                  </Typography>
                )}
              </List>
            </TabPanel>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          {dialogType !== 'view' && (
            <Button variant="contained" onClick={handleSaveMaterial}>
              Kaydet
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Chemical Composition Dialog */}
      <Dialog open={chemicalDialogOpen} onClose={() => setChemicalDialogOpen(false)}>
        <DialogTitle>Kimyasal Element Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              freeSolo
              options={currentMaterialStandard ? 
                currentMaterialStandard.chemicalComposition.map(comp => comp.element) : 
                ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Mo', 'V', 'Ti', 'Al', 'Cu', 'Nb', 'W', 'Co', 'Fe', 'Zn', 'Mg', 'O', 'N', 'H']
              }
              value={currentChemical.element}
              onChange={(_, value) => {
                const elementValue = value || '';
                setCurrentChemical(prev => ({ ...prev, element: elementValue }));
                
                if (elementValue && currentMaterialStandard) {
                  // Seçilen element için standart değerleri bul
                  const standardElement = currentMaterialStandard.chemicalComposition.find(
                    comp => comp.element === elementValue
                  );
                  
                  if (standardElement) {
                    setCurrentChemical({
                      element: elementValue,
                      percentage: standardElement.typical || ((standardElement.minValue + standardElement.maxValue) / 2),
                      specification: currentMaterialStandard.standard,
                      minValue: standardElement.minValue,
                      maxValue: standardElement.maxValue,
                      status: 'GEÇTİ'
                    });
                    showSnackbar(`${elementValue} elementi için spesifikasyon değerleri yüklendi`, 'success');
                  } else {
                    // Manuel giriş için tipik element değerleri
                    const typicalElement = getTypicalElementValues(elementValue);
                    setCurrentChemical(prev => ({
                      ...prev,
                      element: elementValue,
                      specification: prev.specification || 'Manuel Giriş',
                      minValue: typicalElement.minValue,
                      maxValue: typicalElement.maxValue
                    }));
                    showSnackbar(`${elementValue} seçildi. Tipik değerler yüklendi.`, 'info');
                  }
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Element" 
                  placeholder="örn: C, Si, Mn, P, S"
                  helperText={currentMaterialStandard ? "Standart elementleri seçin" : "Manuel giriş"} 
                />
              )}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Ölçülen Yüzde (%)"
                type="number"
                inputProps={{ step: 0.01 }}
                value={currentChemical.percentage}
                onChange={(e) => setCurrentChemical(prev => ({ ...prev, percentage: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                label="Spesifikasyon"
                value={currentChemical.specification}
                onChange={(e) => setCurrentChemical(prev => ({ ...prev, specification: e.target.value }))}
                placeholder="örn: DIN EN 10025-2"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Min Değer (%)"
                type="number"
                inputProps={{ step: 0.01 }}
                value={currentChemical.minValue}
                onChange={(e) => setCurrentChemical(prev => ({ ...prev, minValue: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                label="Max Değer (%)"
                type="number"
                inputProps={{ step: 0.01 }}
                value={currentChemical.maxValue}
                onChange={(e) => setCurrentChemical(prev => ({ ...prev, maxValue: Number(e.target.value) }))}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChemicalDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddChemical}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Hardness Dialog */}
      <Dialog open={hardnessDialogOpen} onClose={() => setHardnessDialogOpen(false)}>
        <DialogTitle>Sertlik Değeri Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                              <FormControl fullWidth>
                  <InputLabel>Sertlik Tipi</InputLabel>
                  <Select
                    value={currentHardness.type}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      
                      if (selectedType && currentMaterialStandard) {
                        // Seçilen sertlik tipi için standart değerleri bul
                        const standardHardness = currentMaterialStandard.hardnessRequirements.find(
                          hard => hard.type === selectedType
                        );
                        
                        if (standardHardness) {
                          setCurrentHardness({
                            type: selectedType,
                            value: standardHardness.typical || ((standardHardness.minValue + standardHardness.maxValue) / 2),
                            specification: currentMaterialStandard.standard,
                            minValue: standardHardness.minValue,
                            maxValue: standardHardness.maxValue,
                            testPosition: standardHardness.testPosition,
                            status: 'GEÇTİ'
                          });
                          showSnackbar(`${selectedType} sertlik testi için spesifikasyon değerleri yüklendi`, 'success');
                        } else {
                          // Manuel giriş için tipik sertlik değerleri
                          const typicalHardness = getTypicalHardnessValues(selectedType);
                          setCurrentHardness({
                            type: selectedType,
                            value: (typicalHardness.minValue + typicalHardness.maxValue) / 2,
                            specification: 'Manuel Giriş',
                            minValue: typicalHardness.minValue,
                            maxValue: typicalHardness.maxValue,
                            testPosition: typicalHardness.testPosition,
                            status: 'GEÇTİ'
                          });
                          showSnackbar(`${selectedType} seçildi. Tipik değerler yüklendi.`, 'info');
                        }
                      } else {
                        // Manuel giriş için tipik sertlik değerleri
                        const typicalHardness = getTypicalHardnessValues(selectedType);
                        setCurrentHardness({
                          type: selectedType,
                          value: (typicalHardness.minValue + typicalHardness.maxValue) / 2,
                          specification: 'Manuel Giriş',
                          minValue: typicalHardness.minValue,
                          maxValue: typicalHardness.maxValue,
                          testPosition: typicalHardness.testPosition,
                          status: 'GEÇTİ'
                        });
                      }
                    }}
                    label="Sertlik Tipi"
                  >
                    <MenuItem value="HRC">HRC (Rockwell C)</MenuItem>
                    <MenuItem value="HRB">HRB (Rockwell B)</MenuItem>
                    <MenuItem value="HV">HV (Vickers)</MenuItem>
                    <MenuItem value="HB">HB (Brinell)</MenuItem>
                    <MenuItem value="Shore A">Shore A</MenuItem>
                    <MenuItem value="Shore D">Shore D</MenuItem>
                  </Select>
                  {currentMaterialStandard && (
                    <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                      Spesifikasyon otomatik yüklenecek
                    </Box>
                  )}
                </FormControl>
              <TextField
                fullWidth
                label="Ölçülen Değer"
                type="number"
                value={currentHardness.value}
                onChange={(e) => setCurrentHardness(prev => ({ ...prev, value: Number(e.target.value) }))}
              />
            </Box>
            <TextField
              fullWidth
              label="Spesifikasyon"
              value={currentHardness.specification}
              onChange={(e) => setCurrentHardness(prev => ({ ...prev, specification: e.target.value }))}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Min Değer"
                type="number"
                value={currentHardness.minValue}
                onChange={(e) => setCurrentHardness(prev => ({ ...prev, minValue: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                label="Max Değer"
                type="number"
                value={currentHardness.maxValue}
                onChange={(e) => setCurrentHardness(prev => ({ ...prev, maxValue: Number(e.target.value) }))}
              />
            </Box>
            <TextField
              fullWidth
              label="Test Pozisyonu"
              value={currentHardness.testPosition}
              onChange={(e) => setCurrentHardness(prev => ({ ...prev, testPosition: e.target.value }))}
              placeholder="örn: Yüzey, Çekirdek, Kenar"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHardnessDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddHardness}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Mechanical Properties Dialog */}
      <Dialog open={mechanicalDialogOpen} onClose={() => setMechanicalDialogOpen(false)}>
        <DialogTitle>Mekanik Özellik Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={[
                'Çekme Dayanımı',
                'Akma Dayanımı',
                'Uzama',
                'Çentik Darbe (Charpy V) +20°C',
                'Çentik Darbe (Charpy V) 0°C',
                'Çentik Darbe (Charpy V) -20°C',
                'Çentik Darbe (Charpy V) -40°C',
                'Çentik Darbe (Charpy V) -54°C',
                'Çentik Darbe (Charpy V) -196°C',
                'Çentik Darbe (Izod) +20°C',
                'Çentik Darbe (Izod) -20°C',
                'Elastisite Modülü',
                'Kayma Modülü',
                'Poisson Oranı',
                'Eğilme Dayanımı',
                'Kayma Dayanımı',
                'Yorulma Dayanımı',
                'Sürünme Dayanımı',
                'Kırılma Tokluğu',
                'Aşınma Direnci',
                'Sıkışma Dayanımı',
                'Korozyon Direnci',
                'Yoğunluk',
                'Termal İletkenlik',
                'Elektriksel İletkenlik',
                'Termal Genleşme Katsayısı'
              ]}
              value={currentMechanical.property}
              onChange={(_, value) => {
                const propertyValue = value || '';
                
                if (propertyValue && currentMaterialStandard) {
                  // Seçilen özellik için standart değerleri bul
                  const standardProperty = currentMaterialStandard.mechanicalProperties.find(
                    p => p.property === propertyValue
                  );
                  
                  if (standardProperty) {
                    setCurrentMechanical({
                      property: propertyValue,
                      value: standardProperty.typical || ((standardProperty.minValue + standardProperty.maxValue) / 2),
                      unit: standardProperty.unit,
                      specification: currentMaterialStandard.standard,
                      minValue: standardProperty.minValue,
                      maxValue: standardProperty.maxValue,
                      testMethod: standardProperty.testMethod,
                      status: 'GEÇTİ'
                    });
                    showSnackbar(`${propertyValue} için spesifikasyon değerleri yüklendi`, 'success');
                  } else {
                    // Manuel giriş için tipik değerler
                    const tempValues = getTypicalValuesForProperty(propertyValue);
                    setCurrentMechanical({
                      property: propertyValue,
                      value: (tempValues.minValue + tempValues.maxValue) / 2,
                      unit: tempValues.unit,
                      specification: 'Manuel Giriş',
                      minValue: tempValues.minValue,
                      maxValue: tempValues.maxValue,
                      testMethod: tempValues.testMethod,
                      status: 'GEÇTİ'
                    });
                    showSnackbar(`${propertyValue} seçildi. Tipik değerler yüklendi.`, 'info');
                  }
                } else {
                  // Manuel giriş için tipik değerler
                  const tempValues = getTypicalValuesForProperty(propertyValue);
                  setCurrentMechanical({
                    property: propertyValue,
                    value: (tempValues.minValue + tempValues.maxValue) / 2,
                    unit: tempValues.unit,
                    specification: 'Manuel Giriş',
                    minValue: tempValues.minValue,
                    maxValue: tempValues.maxValue,
                    testMethod: tempValues.testMethod,
                    status: 'GEÇTİ'
                  });
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Özellik" 
                  helperText={currentMaterialStandard ? "Spesifikasyon otomatik yüklenecek" : "Manuel giriş"} 
                />
              )}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Ölçülen Değer"
                type="number"
                value={currentMechanical.value}
                onChange={(e) => setCurrentMechanical(prev => ({ ...prev, value: Number(e.target.value) }))}
              />
              <Autocomplete
                freeSolo
                options={['MPa', 'N/mm²', '%', 'J', 'GPa', 'HV', 'saat', 'MPa√m', 'kg/m³', 'W/mK', 'S/m', '1/K']}
                value={currentMechanical.unit}
                onChange={(_, value) => setCurrentMechanical(prev => ({ ...prev, unit: value || '' }))}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Birim" 
                    placeholder="örn: MPa, N/mm², %, J"
                  />
                )}
              />
            </Box>
            <TextField
              fullWidth
              label="Spesifikasyon"
              value={currentMechanical.specification}
              onChange={(e) => setCurrentMechanical(prev => ({ ...prev, specification: e.target.value }))}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Min Değer"
                type="number"
                value={currentMechanical.minValue}
                onChange={(e) => setCurrentMechanical(prev => ({ ...prev, minValue: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                label="Max Değer"
                type="number"
                value={currentMechanical.maxValue}
                onChange={(e) => setCurrentMechanical(prev => ({ ...prev, maxValue: Number(e.target.value) }))}
              />
            </Box>
            <Autocomplete
              freeSolo
              options={[
                'ISO 6892-1', 'ASTM E8', 'ISO 148-1', 'ASTM E23', 'ISO 1099', 'ASTM D7791',
                'ASTM E399', 'ASTM G99', 'ISO 604', 'ASTM A262', 'ASTM B557', 'ASTM E111',
                'DIN 50106', 'DIN EN 10002', 'JIS Z2241', 'JIS Z2242'
              ]}
              value={currentMechanical.testMethod}
              onChange={(_, value) => setCurrentMechanical(prev => ({ ...prev, testMethod: value || '' }))}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Test Metodu" 
                  placeholder="örn: ISO 6892-1, ASTM E8"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMechanicalDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddMechanical}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaterialCertificateTracking;

/*
 * Context7 - Malzeme Sertifika Takibi Modülü - Otomatik Entegrasyon Sistemi
 * 
 * OTOMATIK ENTEGRASYON ÖZELLİKLERİ:
 * - 4 Adımlı Seçim: Kategori → Alt Kategori → Kalite → Standart
 * - Tek Tıkla Tam Entegrasyon: Kimyasal + Sertlik + Mekanik değerler
 * - 60+ Malzeme Kalitesi: S355J2, 42CrMo4, 304, 316L, 6061, Ti-6Al-4V
 * - 25+ Standart Desteği: DIN, ASTM, ISO, EN standartları
 * - Context7 Güvenli Veri Yönetimi: Otomatik validasyon ve hata yönetimi
 * 
 * KULLANIM:
 * 1. Malzeme kategorisi seçin
 * 2. Alt kategori seçin
 * 3. Malzeme kalitesi seçin
 * 4. Standart seçin
 * 5. "OTOMATIK ENTEGRE ET" butonuna tıklayın
 * 
 * SONUÇ: Tüm kimyasal elementler, sertlik testleri ve mekanik özellikler
 * otomatik olarak standart değerleriyle birlikte yüklenir.
 */ 