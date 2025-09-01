import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { CustomThemeProvider, useThemeContext } from './context/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// ✅ MERKEZI VERİ SİSTEMİ IMPORT
import { initializeDataIntegration } from './utils/ModuleDataIntegrator';

// Components
import Layout from './components/Layout';

// ✅ LAZY LOADING - Bundle boyutunu küçültmek için
const Dashboard = lazy(() => import('./pages/Dashboard'));
const QualityControlReportsList = lazy(() => import('./pages/QualityControlReportsList'));
const TankLeakTest = lazy(() => import('./pages/TankLeakTest'));
const DOF8DManagement = lazy(() => import('./pages/DOF8DManagement'));
const QualityCostManagement = lazy(() => import('./pages/QualityCostManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const ISO5817WeldLimit = lazy(() => import('./pages/ISO5817WeldLimit'));
const WpsGenerator = lazy(() => import('./pages/WpsGenerator'));
const DocumentManagement = lazy(() => import('./pages/DocumentManagement'));
const SupplierQualityManagement = lazy(() => import('./pages/SupplierQualityManagement'));
const WeldingCostCalculation = lazy(() => import('./pages/WeldingCostCalculation'));
const EquipmentCalibrationManagement = lazy(() => import('./pages/EquipmentCalibrationManagement'));
const QualityManagement = lazy(() => import('./pages/QualityManagement'));
const DimensionalControlSystem = lazy(() => import('./pages/DimensionalControlSystem'));
const MaterialCertificateTracking = lazy(() => import('./pages/MaterialCertificateTracking'));
const FanTestAnalysis = lazy(() => import('./pages/FanTestAnalysis'));
const InternalAuditManagement = lazy(() => import('./pages/InternalAuditManagement'));
const RiskManagement = lazy(() => import('./pages/RiskManagement'));
const CustomerFeedbackManagement = lazy(() => import('./pages/CustomerFeedbackManagement'));
const TrainingManagement = lazy(() => import('./pages/TrainingManagement'));
const ProductionQualityTracking = lazy(() => import('./pages/ProductionQualityTracking'));
const QuarantineManagement = lazy(() => import('./pages/QuarantineManagement'));
const VehicleQualityControl = lazy(() => import('./pages/VehicleQualityControl'));
const DeviationApprovalManagement = lazy(() => import('./pages/DeviationApprovalManagement'));

// ✅ LOADING COMPONENT
const PageLoader = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={60} />
    <div>Sayfa yükleniyor...</div>
  </Box>
);

// ✅ PROTECTED LAYOUT WRAPPER - Suspense ile otomatik sarma
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </Layout>
  </ProtectedRoute>
);

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
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />

          <Route path="/quality-control-reports" element={
            <ProtectedLayout>
              <QualityControlReportsList />
            </ProtectedLayout>
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
