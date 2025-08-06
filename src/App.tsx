import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Science as QualityIcon,
  Engineering as EngineeringIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const drawerWidth = 280;

const menuItems = [
  { text: 'Ana Panel', icon: <DashboardIcon />, id: 'dashboard' },
  { text: 'DF ve 8D Yönetimi', icon: <AssignmentIcon />, id: 'dof' },
  { text: 'Kalitesizlik Maliyeti', icon: <AnalyticsIcon />, id: 'quality-cost' },
  { text: 'Tank Sızdırmazlık Testi', icon: <QualityIcon />, id: 'tank-test' },
  { text: 'WPS Yönetimi', icon: <EngineeringIcon />, id: 'wps' },
  { text: 'İç Tetkik Yönetimi', icon: <AssignmentIcon />, id: 'audit' },
  { text: 'Doküman Yönetimi', icon: <DescriptionIcon />, id: 'documents' },
];

function App() {
  const [open, setOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (menuId: string) => {
    setSelectedMenu(menuId);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              AYD Kaynakhane Kalite Yönetim Sistemi
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Toplam DF
                    </Typography>
                    <Typography variant="h4">
                      24
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Aktif Testler
                    </Typography>
                    <Typography variant="h4">
                      12
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      WPS Sayısı
                    </Typography>
                    <Typography variant="h4">
                      48
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Toplam Maliyet
                    </Typography>
                    <Typography variant="h4">
                      ₺125,000
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              {menuItems.find(item => item.id === selectedMenu)?.text}
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Typography>
                Bu modül geliştirilme aşamasındadır. Yakında hizmetinizde olacak.
              </Typography>
            </Paper>
          </Box>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${open ? drawerWidth : 0}px)`,
            ml: `${open ? drawerWidth : 0}px`,
            transition: 'width 0.3s, margin 0.3s',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              AYD Kaynakhane Kalite Yönetim Sistemi
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Toolbar />
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={selectedMenu === item.id}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
            transition: 'margin 0.3s',
            ml: open ? 0 : `-${drawerWidth}px`,
          }}
        >
          <Toolbar />
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 