/**
 * QUALITY COST MIGRATION HELPER
 * Kalitesizlik Maliyeti modülü için LocalStorage → Supabase geçiş aracı
 * Gerçek zamanlı senkronizasyon sağlar
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Alert,
    Chip,
    Divider,
    Grid,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    CloudSync,
    Storage,
    CheckCircle,
    Warning,
    Error,
    Sync,
    CloudUpload,
    Analytics,
    Dashboard,
    RefreshOutlined,
    DataObject
} from '@mui/icons-material';
import { qualityCostSupabaseService } from '../services/qualityCostSupabaseService';

interface MigrationStats {
    localStorageCount: number;
    supabaseCount: number;
    totalAmount: number;
    migrationNeeded: boolean;
    lastSync?: string;
}

const QualityCostMigrationHelper: React.FC = () => {
    const [stats, setStats] = useState<MigrationStats>({
        localStorageCount: 0,
        supabaseCount: 0,
        totalAmount: 0,
        migrationNeeded: false
    });
    
    const [migrating, setMigrating] = useState(false);
    const [migrationProgress, setMigrationProgress] = useState(0);
    const [migrationResult, setMigrationResult] = useState<{
        success: boolean;
        message: string;
        details?: any;
    } | null>(null);
    
    const [showDetails, setShowDetails] = useState(false);
    const [realTimeSync, setRealTimeSync] = useState(false);

    // İlk yükleme ve istatistikleri getir
    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // LocalStorage verilerini kontrol et
            const localData = localStorage.getItem('kys-cost-management-data');
            const localCosts = localData ? JSON.parse(localData) : [];
            
            // Supabase verilerini kontrol et
            const supabaseCosts = await qualityCostSupabaseService.getAllQualityCosts();
            const totalAmount = await qualityCostSupabaseService.getTotalCosts();
            
            setStats({
                localStorageCount: localCosts.length,
                supabaseCount: supabaseCosts.length,
                totalAmount,
                migrationNeeded: localCosts.length > 0 && supabaseCosts.length === 0,
                lastSync: localStorage.getItem('quality-cost-last-sync') || undefined
            });
            
        } catch (error) {
            console.error('❌ İstatistik yükleme hatası:', error);
        }
    };

    const handleMigration = async () => {
        setMigrating(true);
        setMigrationProgress(0);
        
        try {
            // Migration başlat
            const result = await qualityCostSupabaseService.migrateFromLocalStorage();
            
            setMigrationProgress(100);
            setMigrationResult({
                success: result.errors.length === 0,
                message: result.errors.length === 0 
                    ? `✅ ${result.costs} kalite maliyeti başarıyla transfer edildi!`
                    : `⚠️ ${result.costs} kayıt transfer edildi, ${result.errors.length} hata oluştu`,
                details: result
            });
            
            // LastSync timestamp kaydet
            localStorage.setItem('quality-cost-last-sync', new Date().toISOString());
            
            // İstatistikleri yenile
            await loadStats();
            
        } catch (error: any) {
            setMigrationResult({
                success: false,
                message: `❌ Migration hatası: ${error.message}`,
                details: error
            });
        } finally {
            setMigrating(false);
        }
    };

    const handleRealTimeSync = async () => {
        setRealTimeSync(true);
        
        try {
            // Real-time subscription başlat
            const subscription = qualityCostSupabaseService.subscribeToChanges((payload) => {
                console.log('🔄 Quality Cost real-time update:', payload);
                loadStats(); // İstatistikleri yenile
            });
            
            // Cleanup için subscription'ı kaydet
            (window as any).qualityCostSubscription = subscription;
            
            alert('✅ Real-time senkronizasyon aktif! Artık tüm değişiklikler anlık olarak senkronize edilecek.');
            
        } catch (error: any) {
            alert(`❌ Real-time senkronizasyon hatası: ${error.message}`);
        } finally {
            setRealTimeSync(false);
        }
    };

    const getStatusColor = () => {
        if (stats.migrationNeeded) return 'warning';
        if (stats.supabaseCount > 0) return 'success';
        return 'info';
    };

    const getStatusIcon = () => {
        if (stats.migrationNeeded) return <Warning />;
        if (stats.supabaseCount > 0) return <CheckCircle />;
        return <CloudSync />;
    };

    const getStatusMessage = () => {
        if (stats.migrationNeeded) {
            return `${stats.localStorageCount} kalite maliyeti kaydı LocalStorage'da bekliyor`;
        }
        if (stats.supabaseCount > 0) {
            return `${stats.supabaseCount} kayıt Supabase'de senkronize`;
        }
        return 'Veri bulunamadı';
    };

    return (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                        <CloudSync color="primary" />
                        Kalite Maliyeti - Supabase Senkronizasyon
                    </Typography>
                    
                    <IconButton onClick={loadStats} size="small">
                        <RefreshOutlined />
                    </IconButton>
                </Box>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={3}>
                        <Alert 
                            severity={getStatusColor()} 
                            icon={getStatusIcon()}
                            sx={{ height: '100%' }}
                        >
                            <Typography variant="subtitle2">
                                {getStatusMessage()}
                            </Typography>
                        </Alert>
                    </Grid>
                    
                    <Grid item xs={12} md={9}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color="primary">
                                        {stats.localStorageCount}
                                    </Typography>
                                    <Typography variant="caption" display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                        <Storage fontSize="small" />
                                        LocalStorage
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color="success.main">
                                        {stats.supabaseCount}
                                    </Typography>
                                    <Typography variant="caption" display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                        <CloudUpload fontSize="small" />
                                        Supabase
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color="warning.main">
                                        {new Intl.NumberFormat('tr-TR').format(stats.totalAmount)} ₺
                                    </Typography>
                                    <Typography variant="caption" display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                        <Analytics fontSize="small" />
                                        Toplam Maliyet
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color="info.main">
                                        {stats.lastSync ? 'Aktif' : 'Pasif'}
                                    </Typography>
                                    <Typography variant="caption" display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                        <Sync fontSize="small" />
                                        Senkronizasyon
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" gap={2} flexWrap="wrap">
                    {stats.migrationNeeded && (
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={migrating ? <CircularProgress size={20} /> : <CloudUpload />}
                            onClick={handleMigration}
                            disabled={migrating}
                        >
                            {migrating ? 'Transfer Ediliyor...' : 'LocalStorage → Supabase Transfer'}
                        </Button>
                    )}
                    
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={realTimeSync ? <CircularProgress size={20} /> : <Sync />}
                        onClick={handleRealTimeSync}
                        disabled={realTimeSync}
                    >
                        {realTimeSync ? 'Aktivasyonda...' : 'Real-Time Senkronizasyon Aktif Et'}
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<DataObject />}
                        onClick={() => setShowDetails(true)}
                    >
                        Detaylı Bilgi
                    </Button>
                </Box>

                {migrating && (
                    <Box mt={2}>
                        <Typography variant="body2" mb={1}>
                            Migration ilerliyor...
                        </Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={migrationProgress}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                )}

                {migrationResult && (
                    <Alert 
                        severity={migrationResult.success ? 'success' : 'error'} 
                        sx={{ mt: 2 }}
                        onClose={() => setMigrationResult(null)}
                    >
                        {migrationResult.message}
                    </Alert>
                )}

                {stats.lastSync && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                        Son senkronizasyon: {new Date(stats.lastSync).toLocaleString('tr-TR')}
                    </Typography>
                )}
            </CardContent>

            {/* Detaylı Bilgi Dialog */}
            <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Kalite Maliyeti - Senkronizasyon Detayları
                </DialogTitle>
                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemIcon><Storage /></ListItemIcon>
                            <ListItemText 
                                primary="LocalStorage Durumu"
                                secondary={`${stats.localStorageCount} kayıt mevcut`}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemIcon><CloudUpload /></ListItemIcon>
                            <ListItemText 
                                primary="Supabase Durumu"
                                secondary={`${stats.supabaseCount} kayıt senkronize`}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemIcon><Analytics /></ListItemIcon>
                            <ListItemText 
                                primary="Toplam Maliyet"
                                secondary={`${new Intl.NumberFormat('tr-TR').format(stats.totalAmount)} ₺`}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemIcon><Sync /></ListItemIcon>
                            <ListItemText 
                                primary="Real-Time Senkronizasyon"
                                secondary={stats.lastSync ? `Aktif - Son: ${new Date(stats.lastSync).toLocaleString('tr-TR')}` : 'Henüz aktifleştirilmedi'}
                            />
                        </ListItem>
                    </List>

                    {migrationResult?.details && (
                        <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Migration Detayları:
                            </Typography>
                            <pre style={{ fontSize: '12px', overflow: 'auto', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                                {JSON.stringify(migrationResult.details, null, 2)}
                            </pre>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDetails(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default QualityCostMigrationHelper;
