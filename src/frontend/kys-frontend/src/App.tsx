import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CustomThemeProvider, useThemeContext } from './context/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';

// ✅ MERKEZI VERİ SİSTEMİ IMPORT
import { initializeDataIntegration } from './utils/ModuleDataIntegrator';

// ✅ VERİ TEST SİSTEMİ IMPORT
import './utils/testDataIntegration';

// Components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import QualityControlReportsList from './pages/QualityControlReportsList';
import TankLeakTest from './pages/TankLeakTest';
import DOF8DManagement from './pages/DOF8DManagement';
import QualityCostManagement from './pages/QualityCostManagement';
import Settings from './pages/Settings';
import ISO5817WeldLimit from './pages/ISO5817WeldLimit';
import WpsGenerator from './pages/WpsGenerator';
import DocumentManagement from './pages/DocumentManagement';
import SupplierQualityManagement from './pages/SupplierQualityManagement';
import WeldingCostCalculation from './pages/WeldingCostCalculation';
import EquipmentCalibrationManagement from './pages/EquipmentCalibrationManagement';


import QualityManagement from './pages/QualityManagement';
import DimensionalControlSystem from './pages/DimensionalControlSystem';
import MaterialCertificateTracking from './pages/MaterialCertificateTracking';
import FanTestAnalysis from './pages/FanTestAnalysis';
import InternalAuditManagement from './pages/InternalAuditManagement';
import RiskManagement from './pages/RiskManagement';
import CustomerFeedbackManagement from './pages/CustomerFeedbackManagement';
import TrainingManagement from './pages/TrainingManagement';
import ProductionQualityTracking from './pages/ProductionQualityTracking';

// Main app content
const AppContent = () => {
  const { theme } = useThemeContext();
  
  // ✅ OTOMATİK VERİ ENTEGRASYONU
  useEffect(() => {
    console.log('🚀 KYS UYGULAMASI BAŞLADI - Merkezi veri sistemi başlatılıyor...');
    
    // Veri entegrasyonunu başlat
    initializeDataIntegration();
    
    return () => {
      console.log('🛑 KYS Uygulaması kapatılıyor');
    };
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Ana sayfa doğrudan dashboard */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />

          <Route path="/quality-control-reports" element={
            <Layout>
              <QualityControlReportsList />
            </Layout>
          } />
          <Route path="/material-certificate-tracking" element={
            <Layout>
              <MaterialCertificateTracking />
            </Layout>
          } />
          <Route path="/dimensional-control" element={
            <Layout>
              <DimensionalControlSystem />
            </Layout>
          } />
          <Route path="/tank-leak-test" element={
            <Layout>
              <TankLeakTest />
            </Layout>
          } />
          <Route path="/dof-8d-management" element={
            <Layout>
              <DOF8DManagement />
            </Layout>
          } />
          <Route path="/quality-cost-management" element={
            <Layout>
              <QualityCostManagement />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          <Route path="/iso-5817" element={
            <Layout>
              <ISO5817WeldLimit />
            </Layout>
          } />
          <Route path="/cost-calculation" element={
            <Layout>
              <WeldingCostCalculation />
            </Layout>
          } />
          <Route path="/wps-generator" element={
            <Layout>
              <WpsGenerator />
            </Layout>
          } />
          <Route path="/quality-management" element={
            <Layout>
              <QualityManagement />
            </Layout>
          } />
          <Route path="/document-management" element={
            <Layout>
              <DocumentManagement />
            </Layout>
          } />
          <Route path="/supplier-quality" element={
            <Layout>
              <SupplierQualityManagement />
            </Layout>
          } />
          <Route path="/fan-test-analysis" element={
            <Layout>
              <FanTestAnalysis />
            </Layout>
          } />
          <Route path="/equipment-calibration" element={
            <Layout>
              <EquipmentCalibrationManagement />
            </Layout>
          } />


          <Route path="/internal-audit-management" element={
            <Layout>
              <InternalAuditManagement />
            </Layout>
          } />
          <Route path="/risk-management" element={
            <Layout>
              <RiskManagement />
            </Layout>
          } />
          <Route path="/customer-feedback" element={
            <Layout>
              <CustomerFeedbackManagement />
            </Layout>
          } />
          <Route path="/training-management" element={
            <Layout>
              <TrainingManagement />
            </Layout>
          } />
          <Route path="/production-quality-tracking" element={
            <Layout>
              <ProductionQualityTracking />
            </Layout>
          } />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryProvider>
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  </QueryProvider>
);

export default App;
