import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Paper, 
  Avatar, 
  Alert 
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi gereklidir'),
});

const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        clearError();
        setLoginError(null);
        await login(values);
        navigate('/');
      } catch (error: any) {
        setLoginError(error.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyiniz.');
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Giriş
        </Typography>
        
        {(error || loginError) && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error || loginError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">
              {"Hesabınız yok mu? Kayıt olun"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 