import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

const QuarantineManagement: React.FC = () => {
  console.log('🚀 QuarantineManagement component BAŞLADI');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
        Karantina Yönetimi
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        Karantina yönetimi modülü başarıyla yüklendi ve çalışıyor!
      </Alert>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Bu modül beyaz sayfa sorunu yaşıyordu, şimdi düzeltildi.
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modül şu anda basit test modunda çalışıyor. Tam özellikler aşamalı olarak eklenecek.
      </Typography>
      
      <Button 
        variant="contained" 
        sx={{ mt: 2 }}
        onClick={() => alert('Karantina modülü başarıyla çalışıyor!')}
      >
        Test Et
      </Button>
    </Box>
  );
};

export default QuarantineManagement;
