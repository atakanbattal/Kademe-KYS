import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Business
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../services/authService';

const Login: React.FC = () => {
    const { login, loading } = useAuth();
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!credentials.email || !credentials.password) {
            setError('Lütfen email ve şifre alanlarını doldurun');
            return;
        }

        try {
            await login(credentials);
            // Başarılı giriş sonrası AuthContext user state'ini güncelleyecek
        } catch (error: any) {
            console.error('Login error:', error);
            
            if (error.response?.status === 401) {
                setError('Email veya şifre hatalı');
            } else if (error.response?.status === 403) {
                setError('Hesabınız aktif değil, lütfen yöneticinize başvurun');
            } else {
                setError('Giriş yapılırken bir hata oluştu, lütfen tekrar deneyiniz');
            }
        }
    };

    const handleInputChange = (field: keyof LoginCredentials) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setCredentials(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        
        // Hata mesajını temizle
        if (error) {
            setError('');
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <Container 
            component="main" 
            maxWidth="sm"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3
            }}
        >
            <Paper 
                elevation={8}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 2
                }}
            >
                {/* Logo ve Başlık */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Business 
                        sx={{ 
                            fontSize: 48, 
                            color: 'primary.main',
                            mb: 1 
                        }} 
                    />
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 1
                        }}
                    >
                        Kademe A.Ş.
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Kalite Yönetim Sistemi
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                    >
                        Devam etmek için giriş yapın
                    </Typography>
                </Box>

                {/* Hata Mesajı */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ width: '100%', mb: 2 }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {/* Login Formu */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Adresi"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={credentials.email}
                        onChange={handleInputChange('email')}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Şifre"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={handleInputChange('password')}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                        disabled={loading}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || !credentials.email || !credentials.password}
                        sx={{ 
                            mt: 1, 
                            mb: 2,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Giriş Yap'
                        )}
                    </Button>
                </Box>


            </Paper>
        </Container>
    );
};

export default Login;