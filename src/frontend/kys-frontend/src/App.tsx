import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box, Typography } from '@mui/material';
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

// ✅ OPTIMIZED LOADING COMPONENT
const PageLoader = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '40vh',
      flexDirection: 'column',
      gap: 2,
      opacity: 1,
      transition: 'opacity 0.3s ease-in-out'
    }}
  >
    <CircularProgress 
      size={48} 
      thickness={4}
      sx={{
        color: 'primary.main',
        animationDuration: '1s !important'
      }}
    />
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        fontSize: '0.875rem',
        fontWeight: 500
      }}
    >
      Modül yükleniyor...
    </Typography>
  </Box>
);

// ✅ PROTECTED LAYOUT WRAPPER - Optimized Suspense ile otomatik sarma
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>
      <Suspense 
        fallback={<PageLoader />}
      >
        <Box 
          sx={{ 
            opacity: 1,
            transition: 'opacity 0.2s ease-in-out',
            minHeight: '200px'
          }}
        >
          {children}
        </Box>
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
            <ProtectedLayout>
              <MaterialCertificateTracking />
            </ProtectedLayout>
          } />
          <Route path="/dimensional-control" element={
            <ProtectedLayout>
              <DimensionalControlSystem />
            </ProtectedLayout>
          } />
          <Route path="/tank-leak-test" element={
            <ProtectedLayout>
              <TankLeakTest />
            </ProtectedLayout>
          } />
          <Route path="/dof-8d-management" element={
            <ProtectedLayout>
              <DOF8DManagement />
            </ProtectedLayout>
          } />
          <Route path="/quality-cost-management" element={
            <ProtectedLayout>
              <QualityCostManagement />
            </ProtectedLayout>
          } />
          <Route path="/settings" element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          } />
          <Route path="/iso-5817" element={
            <ProtectedLayout>
              <ISO5817WeldLimit />
            </ProtectedLayout>
          } />
          <Route path="/cost-calculation" element={
            <ProtectedLayout>
              <WeldingCostCalculation />
            </ProtectedLayout>
          } />
          <Route path="/wps-generator" element={
            <ProtectedLayout>
              <WpsGenerator />
            </ProtectedLayout>
          } />
          <Route path="/quality-management" element={
            <ProtectedLayout>
              <QualityManagement />
            </ProtectedLayout>
          } />
          <Route path="/vehicle-quality-control" element={
            <ProtectedLayout>
              <VehicleQualityControl />
            </ProtectedLayout>
          } />
          <Route path="/document-management" element={
            <ProtectedLayout>
              <DocumentManagement />
            </ProtectedLayout>
          } />
          <Route path="/supplier-quality" element={
            <ProtectedLayout>
              <SupplierQualityManagement />
            </ProtectedLayout>
          } />
          <Route path="/fan-test-analysis" element={
            <ProtectedLayout>
              <FanTestAnalysis />
            </ProtectedLayout>
          } />
          <Route path="/equipment-calibration" element={
            <ProtectedLayout>
              <EquipmentCalibrationManagement />
            </ProtectedLayout>
          } />

          <Route path="/internal-audit-management" element={
            <ProtectedLayout>
              <InternalAuditManagement />
            </ProtectedLayout>
          } />
          <Route path="/risk-management" element={
            <ProtectedLayout>
              <RiskManagement />
            </ProtectedLayout>
          } />
          <Route path="/customer-feedback" element={
            <ProtectedLayout>
              <CustomerFeedbackManagement />
            </ProtectedLayout>
          } />
          <Route path="/training-management" element={
            <ProtectedLayout>
              <TrainingManagement />
            </ProtectedLayout>
          } />
          <Route path="/production-quality-tracking" element={
            <ProtectedLayout>
              <ProductionQualityTracking />
            </ProtectedLayout>
          } />
          <Route path="/quarantine-management" element={
            <ProtectedLayout>
              <QuarantineManagement />
            </ProtectedLayout>
          } />
          <Route path="/deviation-approval" element={
            <ProtectedLayout>
              <DeviationApprovalManagement />
            </ProtectedLayout>
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
