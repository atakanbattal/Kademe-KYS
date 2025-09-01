import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Loading durumunu göster
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                    Sistem yükleniyor...
                </Typography>
            </Box>
        );
    }

    // Kullanıcı giriş yapmamışsa Login sayfasını göster
    if (!isAuthenticated) {
        return <Login />;
    }

    // Kullanıcı giriş yapmışsa içeriği göster
    return <>{children}</>;
};

export default ProtectedRoute;
