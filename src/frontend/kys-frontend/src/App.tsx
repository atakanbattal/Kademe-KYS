import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CustomThemeProvider, useThemeContext } from './context/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

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
import QuarantineManagement from './pages/QuarantineManagement';
import VehicleQualityControl from './pages/VehicleQualityControl';
import DeviationApprovalManagement from './pages/DeviationApprovalManagement';

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
          {/* Login route - authentication gerektirmeyen */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - authentication gerektiren */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/quality-control-reports" element={
            <ProtectedRoute>
              <Layout>
                <QualityControlReportsList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/material-certificate-tracking" element={
            <ProtectedRoute>
              <Layout>
                <MaterialCertificateTracking />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dimensional-control" element={
            <ProtectedRoute>
              <Layout>
                <DimensionalControlSystem />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tank-leak-test" element={
            <ProtectedRoute>
              <Layout>
                <TankLeakTest />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dof-8d-management" element={
            <ProtectedRoute>
              <Layout>
                <DOF8DManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/quality-cost-management" element={
            <ProtectedRoute>
              <Layout>
                <QualityCostManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/iso-5817" element={
            <ProtectedRoute>
              <Layout>
                <ISO5817WeldLimit />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/cost-calculation" element={
            <ProtectedRoute>
              <Layout>
                <WeldingCostCalculation />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/wps-generator" element={
            <ProtectedRoute>
              <Layout>
                <WpsGenerator />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/quality-management" element={
            <ProtectedRoute>
              <Layout>
                <QualityManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/vehicle-quality-control" element={
            <ProtectedRoute>
              <Layout>
                <VehicleQualityControl />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/document-management" element={
            <ProtectedRoute>
              <Layout>
                <DocumentManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/supplier-quality" element={
            <ProtectedRoute>
              <Layout>
                <SupplierQualityManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/fan-test-analysis" element={
            <ProtectedRoute>
              <Layout>
                <FanTestAnalysis />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/equipment-calibration" element={
            <ProtectedRoute>
              <Layout>
                <EquipmentCalibrationManagement />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/internal-audit-management" element={
            <ProtectedRoute>
              <Layout>
                <InternalAuditManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/risk-management" element={
            <ProtectedRoute>
              <Layout>
                <RiskManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/customer-feedback" element={
            <ProtectedRoute>
              <Layout>
                <CustomerFeedbackManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/training-management" element={
            <ProtectedRoute>
              <Layout>
                <TrainingManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/production-quality-tracking" element={
            <ProtectedRoute>
              <Layout>
                <ProductionQualityTracking />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/quarantine-management" element={
            <ProtectedRoute>
              <Layout>
                <QuarantineManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/deviation-approval" element={
            <ProtectedRoute>
              <Layout>
                <DeviationApprovalManagement />
              </Layout>
            </ProtectedRoute>
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CustomThemeProvider>
  </QueryProvider>
);

export default App;
