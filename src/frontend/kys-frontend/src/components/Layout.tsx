/**
 * LAYOUT.TSX - Ana Layout Bileşeni
 * 
 * Bu dosya tüm uygulamanın layout yapısını kontrol eder:
 * - Sidebar/Navigation menüsü buradadır
 * - Header ve company bilgileri burada render edilir
 * - Responsive davranışlar burada yönetilir
 * 
 * ⚠️  ÖNEMLİ: Sidebar düzenlemeleri bu dosyada yapılmalıdır!
 * 
 * @author Atakan Battal
 * @version 2.1.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  Settings as SettingsIcon,
  Engineering as EngineeringIcon,
  BugReport as BugReportIcon,
  MonetizationOn as MonetizationOnIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Calculate as CalculateIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Code as WpsIcon,
  Straighten as StraightenIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ExpandLess,
  ExpandMore,
  Factory as FactoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Responsive drawer widths
const drawerWidthExpanded = 280;
const drawerWidthCollapsed = 72;

// Styled Components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })<{
  open?: boolean;
  isMobile?: boolean;
}>(({ theme, open, isMobile }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.easeInOut,
    duration: 250,
  }),
  // Mobile: Tam genişlik, Desktop: Sidebar genişliğine göre ayarla
  width: isMobile 
    ? '100%' 
    : open 
      ? `calc(100% - ${drawerWidthExpanded}px)` 
      : `calc(100% - ${drawerWidthCollapsed}px)`,
  marginLeft: 0, // Her zaman 0 margin
  transform: 'translateZ(0)', // Hardware acceleration
  willChange: 'width',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    width: '100%',
    marginLeft: 0,
  },
}));

const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })<{
  open?: boolean;
  isMobile?: boolean;
}>(({ theme, open, isMobile }) => ({
  transition: theme.transitions.create(['width', 'margin-left'], {
    easing: theme.transitions.easing.easeInOut,
    duration: 250,
  }),
  width: isMobile ? '100%' : (open ? `calc(100% - ${drawerWidthExpanded}px)` : `calc(100% - ${drawerWidthCollapsed}px)`),
  marginLeft: isMobile ? 0 : (open ? drawerWidthExpanded : drawerWidthCollapsed),
  transform: 'translateZ(0)', // Hardware acceleration
  willChange: 'width, margin-left',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

const CompanyHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(5, 2, 4, 2),
  textAlign: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 140,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></svg>')`,
    backgroundSize: '80px 80px',
    opacity: 0.3,
  }
}));

const CollapsedHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1),
  textAlign: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  fontWeight: 'bold',
}));

const StyledListItemButton = styled(ListItemButton, { shouldForwardProp: (prop) => prop !== 'collapsed' })<{
  collapsed?: boolean;
}>(({ theme, collapsed }) => ({
  borderRadius: collapsed ? '50%' : '12px',
  margin: theme.spacing(0.5, collapsed ? 1 : 1),
  padding: theme.spacing(collapsed ? 1.5 : 1.5, collapsed ? 1.5 : 2),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  minHeight: collapsed ? 48 : 'auto',
  justifyContent: collapsed ? 'center' : 'flex-start',
  transform: 'translateZ(0)', // Hardware acceleration
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}15`,
    transform: collapsed ? 'scale(1.05) translateZ(0)' : 'translateX(4px) translateZ(0)',
    '&::before': {
      width: collapsed ? '100%' : '4px',
    }
  },
  '&.active': {
    backgroundColor: `${theme.palette.primary.main}20`,
    borderLeft: collapsed ? 'none' : `4px solid ${theme.palette.primary.main}`,
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(collapsed ? 1.5 : 1.5),
    fontWeight: 600,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '0px',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  }
}));

const MenuSection = styled(Box, { shouldForwardProp: (prop) => prop !== 'collapsed' })<{
  collapsed?: boolean;
}>(({ theme, collapsed }) => ({
  padding: theme.spacing(1, collapsed ? 0.5 : 2),
  '& .section-title': {
    fontSize: collapsed ? '0.6rem' : '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(collapsed ? 0 : 1),
    textAlign: collapsed ? 'center' : 'left',
    opacity: collapsed ? 0.7 : 1,
    transition: 'all 0.3s ease',
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

interface LayoutProps {
  children: React.ReactNode;
}

const getModuleTitle = (pathname) => {
    // Ana sayfalar
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    
    // Stratejik Yönetim ve Planlama
    if (pathname.startsWith('/quality-management')) return 'KPI Takip ve Yönetim';
    if (pathname.startsWith('/kpi-management')) return 'KPI Takip ve Yönetim';
    if (pathname.startsWith('/quality-cost-management')) return 'Kalite ve Araç Performans Yönetimi';
    if (pathname.startsWith('/quality-cost')) return 'Kalite ve Araç Performans Yönetimi';
    if (pathname.startsWith('/dof-8d-management')) return 'DÖF ve 8D Yönetimi';
    if (pathname.startsWith('/dof-8d')) return 'DÖF ve 8D Yönetimi';
    if (pathname.startsWith('/risk-management')) return 'Risk Yönetimi';
    if (pathname.startsWith('/internal-audit-management')) return 'İç/Çapraz Tetkik Yönetimi';
    if (pathname.startsWith('/internal-audit')) return 'İç/Çapraz Tetkik Yönetimi';
    
    // Tedarik Zinciri ve Malzeme Yönetimi
    if (pathname.startsWith('/supplier-quality')) return 'Tedarikçi Kalite Yönetimi';
    if (pathname.startsWith('/material-certificate-tracking')) return 'Malzeme Sertifika Takibi';
    if (pathname.startsWith('/quarantine-management')) return 'Karantina Yönetimi';
    
    // Üretim ve Kalite Kontrol
    if (pathname.startsWith('/dimensional-control')) return 'Kontrol Planları';
    if (pathname.startsWith('/tank-leak-test')) return 'Tank Sızdırmazlık Testi';
    if (pathname.startsWith('/fan-test-analysis')) return 'Fan Balans ve Kaynak Kalite Analizi';
    if (pathname.startsWith('/fan-test')) return 'Fan Balans ve Kaynak Kalite Analizi';
    if (pathname.startsWith('/cost-calculation')) return 'Kaynak Maliyet Hesaplama';
    if (pathname.startsWith('/iso-5817')) return 'ISO 5817:2023 Kaynak Kalite Limitleri';
    if (pathname.startsWith('/wps-generator')) return 'WPS Oluşturucu';
    if (pathname.startsWith('/production-quality-tracking')) return 'Üretim Kaynaklı Kalite Hata Takip Sistemi';
    
    // Operasyonel Yönetim
  
    if (pathname.startsWith('/equipment-calibration')) return 'Ekipman ve Kalibrasyon Yönetimi';
  
    
    // Sistem Yönetimi
    if (pathname.startsWith('/settings')) return 'Ayarlar';
    
    // Varsayılan
    return 'Kalite Yönetim Sistemi';
};

const Layout: React.FC<LayoutProps> = ({ children }): React.ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Sidebar durumu
  const [open, setOpen] = useState(!isMobile); // Desktop'ta varsayılan açık, mobile'da kapalı
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Kategori açılma durumları
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    quality: true,
    production: true,
    technical: true,
    docSupply: true,
    system: true,
  });

  // Responsive davranış
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleMobileDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleSectionToggle = (section: string) => {
    if (!open) return; // Collapsed modda kategoriler açılmaz
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const coreModules = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', color: theme.palette.primary.main },
  ];

  // Kalite Yönetimi Modülleri
  const qualityModules = [
    { text: 'KPI Takip ve Yönetim', icon: <SpeedIcon />, path: '/quality-management', color: '#2196f3' },
    { text: 'Kalite ve Araç Performans Yönetimi', icon: <MonetizationOnIcon />, path: '/quality-cost-management', color: '#4caf50' },
    { text: 'Üretim Kaynaklı Kalite Hata Takip', icon: <FactoryIcon />, path: '/production-quality-tracking', color: '#f44336' },
    { text: 'Karantina Yönetimi', icon: <SecurityIcon />, path: '/quarantine-management', color: '#e91e63' },
    { text: 'DÖF ve 8D Yönetimi', icon: <BugReportIcon />, path: '/dof-8d-management', color: '#f44336' },
    { text: 'İç Tetkik Yönetimi', icon: <AssignmentTurnedInIcon />, path: '/internal-audit-management', color: '#1976d2' },
    { text: 'Risk Yönetimi', icon: <SecurityIcon />, path: '/risk-management', color: '#e91e63' },
  ];

  // Üretim ve Test Modülleri
  const productionModules = [
    { text: 'ISO 5817 Kaynak Kalite Limitleri', icon: <EngineeringIcon />, path: '/iso-5817', color: '#795548' },
    { text: 'Tank Sızdırmazlık Testi', icon: <ScienceIcon />, path: '/tank-leak-test', color: '#2196f3' },
    { text: 'Fan Balans ve Kaynak Analizi', icon: <EngineeringIcon />, path: '/fan-test-analysis', color: '#9c27b0' },
    { text: 'Kontrol Planları', icon: <StraightenIcon />, path: '/dimensional-control', color: '#ff6b35' },
  ];

  // Teknik Araçlar ve Hesaplama Modülleri
  const technicalModules = [
    { text: 'Kaynak Maliyet Hesaplama', icon: <CalculateIcon />, path: '/cost-calculation', color: '#ff5722' },
    { text: 'WPS Oluşturucu', icon: <WpsIcon />, path: '/wps-generator', color: '#607d8b' },
  ];

  // Doküman ve Tedarik Yönetimi Modülleri
  const documentSupplyModules = [
    { text: 'Tedarikçi Kalite Yönetimi', icon: <BusinessIcon />, path: '/supplier-quality', color: '#3f51b5' },
    { text: 'Malzeme Sertifika Takibi', icon: <AssignmentTurnedInIcon />, path: '/material-certificate-tracking', color: '#4caf50' },
  ];

  // Sistem ve Ekipman Modülleri
  const systemModules = [
    { text: 'Ekipman ve Kalibrasyon Yönetimi', icon: <EngineeringIcon />, path: '/equipment-calibration', color: '#2196f3' },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings', color: theme.palette.text.secondary },
  ];

  const renderMenuSection = (sectionKey: string, title: string, items: any[]) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <MenuSection collapsed={!open}>
        {open ? (
          // Expanded mode - clickable section header
          <ListItemButton
            onClick={() => handleSectionToggle(sectionKey)}
            sx={{
              borderRadius: '8px',
              margin: theme.spacing(0.25, 1),
              padding: theme.spacing(0.5, 1),
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}10`,
              }
            }}
          >
            <Typography className="section-title" sx={{ flexGrow: 1, marginBottom: 0, marginTop: 0 }}>
              {title}
            </Typography>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        ) : (
          // Collapsed mode - simple divider
          <Box sx={{ textAlign: 'center', padding: theme.spacing(1, 0) }}>
            <Divider sx={{ opacity: 0.5 }} />
          </Box>
        )}
        
        <Collapse in={open ? isExpanded : true} timeout={250}>
          <List disablePadding>
            {items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <Tooltip title={!open ? item.text : ''} placement="right" arrow>
                  <StyledListItemButton
                    className={location.pathname === item.path ? 'active' : ''}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) handleMobileDrawerClose();
                    }}
                    collapsed={!open}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: open ? 40 : 'auto', 
                      color: item.color,
                      justifyContent: 'center' 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          lineHeight: 1.3,
                          sx: {
                            wordBreak: 'break-word',
                            whiteSpace: 'normal'
                          }
                        }}
                      />
                    )}
                  </StyledListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </MenuSection>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      {open ? (
        <CompanyHeader>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            gutterBottom 
            sx={{ 
              position: 'relative', 
              zIndex: 1,
              textAlign: 'center',
              lineHeight: 1.2,
              mb: 0.25
            }}
          >
            KADEME A.Ş.
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              opacity: 0.9, 
              fontSize: '0.8rem', 
              position: 'relative', 
              zIndex: 1,
              textAlign: 'center',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              hyphens: 'auto',
              mb: 0.5
            }}
          >
            Kalite Yönetim Sistemi
          </Typography>
          <Box sx={{ 
            position: 'relative', 
            zIndex: 1,
            textAlign: 'center',
            opacity: 0.7,
            fontSize: '0.65rem',
            fontStyle: 'italic',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            pt: 0.5,
            mt: 0.5
          }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 500 }}>
              Developer: Atakan Battal
            </Typography>
          </Box>
        </CompanyHeader>
      ) : (
        <CollapsedHeader>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              K
            </Typography>
            <Typography variant="caption" sx={{ 
              fontSize: '0.5rem', 
              opacity: 0.6,
              fontStyle: 'italic',
              display: 'block',
              lineHeight: 1
            }}>
              AB
            </Typography>
          </Box>
        </CollapsedHeader>
      )}
      
      {/* Toggle Button */}
      {!isMobile && (
        <DrawerHeader>
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateZ(0)',
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
      )}
      
      {/* Menu Content */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        maxHeight: 'calc(100vh - 120px)', // Daha fazla alan
        paddingBottom: '20px', // Alt boşluk
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        scrollBehavior: 'smooth'
      }}>
        {renderMenuSection('core', 'ANA PANEL', coreModules)}
        {renderMenuSection('quality', 'KALİTE YÖNETİMİ', qualityModules)}
        {renderMenuSection('production', 'ÜRETİM VE TEST', productionModules)}
        {renderMenuSection('technical', 'TEKNİK ARAÇLAR', technicalModules)}
        {renderMenuSection('docSupply', 'DOKÜMAN VE TEDARİK', documentSupplyModules)}
        {renderMenuSection('system', 'SİSTEM', systemModules)}
      </Box>
      
      {/* Footer */}
      {open && (
        <Box sx={{ 
          p: 1, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          textAlign: 'center',
          background: `linear-gradient(180deg, transparent 0%, ${theme.palette.action.hover} 100%)`
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            © 2025 KADEME A.Ş.
          </Typography>
          <br />
          <Typography variant="caption" color="primary.main" sx={{ 
            fontSize: '0.6rem', 
            fontStyle: 'italic',
            fontWeight: 600,
            mt: 0.25
          }}>
            Full-Stack Developer: Atakan Battal
          </Typography>
        </Box>
      )}
    </Box>
  );

  const moduleTitle = getModuleTitle(location.pathname);

  return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <StyledAppBar position="fixed" open={open} isMobile={isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {moduleTitle}
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: open ? drawerWidthExpanded : drawerWidthCollapsed }, 
          flexShrink: 0,
          zIndex: (theme) => theme.zIndex.drawer,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
            duration: 250,
          }),
          transform: 'translateZ(0)', // Hardware acceleration
        }}
        aria-label="navigation menu"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidthExpanded,
              zIndex: (theme) => theme.zIndex.drawer + 2
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: open ? drawerWidthExpanded : drawerWidthCollapsed,
              position: 'fixed', // Fixed positioning
              height: 'calc(100vh + 100px)', // Daha uzun yükseklik
              top: 0,
              left: 0,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: 250,
              }),
              overflowX: 'hidden',
              overflowY: 'auto',
              zIndex: (theme) => theme.zIndex.drawer,
              transform: 'translateZ(0)', // Hardware acceleration
              willChange: 'width',
              scrollbarWidth: 'none', // Scroll bar'ı gizle
              '&::-webkit-scrollbar': {
                display: 'none', // Webkit scroll bar'ı gizle
              },
              scrollBehavior: 'smooth', // Yumuşak scroll
            },
          }}
          open={open}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Main open={open} isMobile={isMobile}>
        <Toolbar /> {/* AppBar spacing */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Layout; 