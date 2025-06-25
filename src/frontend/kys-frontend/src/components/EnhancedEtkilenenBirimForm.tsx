import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface EtkilenenBirim {
  id: string;
  birimAdi: string;
  sure: number;
  birimMaliyet: number;
  maliyet: number;
  aciklama: string;
}

interface EnhancedEtkilenenBirimFormProps {
  ekBirimMaliyetleri: EtkilenenBirim[];
  birimler: Array<{ value: string; label: string }>;
  timeUnit: string;
  calculateMainCost: () => number;
  onUpdate: (updatedList: EtkilenenBirim[]) => void;
}

const EnhancedEtkilenenBirimForm: React.FC<EnhancedEtkilenenBirimFormProps> = ({
  ekBirimMaliyetleri,
  birimler,
  timeUnit,
  calculateMainCost,
  onUpdate
}) => {
  
  const handleBirimChange = (index: number, birimAdi: string) => {
    const updated = [...ekBirimMaliyetleri];
    const birimMaliyeti = 50; // Varsayılan değer - gerçekte localStorage'dan çekilecek
    
    updated[index] = {
      ...updated[index],
      birimAdi,
      birimMaliyet: birimMaliyeti,
      maliyet: updated[index].sure * birimMaliyeti
    };
    onUpdate(updated);
  };

  const handleSureChange = (index: number, sure: number) => {
    const updated = [...ekBirimMaliyetleri];
    updated[index] = {
      ...updated[index],
      sure,
      maliyet: sure * (updated[index].birimMaliyet || 0)
    };
    onUpdate(updated);
  };

  const handleAciklamaChange = (index: number, aciklama: string) => {
    const updated = [...ekBirimMaliyetleri];
    updated[index] = { ...updated[index], aciklama };
    onUpdate(updated);
  };

  const handleDelete = (index: number) => {
    const updated = [...ekBirimMaliyetleri];
    updated.splice(index, 1);
    onUpdate(updated);
  };

  const handleAdd = () => {
    const yeniEkBirim: EtkilenenBirim = {
      id: Date.now().toString(),
      birimAdi: '',
      sure: 0,
      birimMaliyet: 0,
      maliyet: 0,
      aciklama: ''
    };
    onUpdate([...ekBirimMaliyetleri, yeniEkBirim]);
  };

  const totalEtkilenenMaliyet = ekBirimMaliyetleri.reduce((sum, item) => sum + (item.maliyet || 0), 0);
  const mainCost = calculateMainCost();
  const grandTotal = mainCost + totalEtkilenenMaliyet;

  return (
    <>
      {/* Etkilenen birimler listesi */}
      {ekBirimMaliyetleri.map((ekBirim, index) => (
        <Grid item xs={12} key={ekBirim.id}>
          <Paper sx={{ p: 2, bgcolor: 'orange.50', border: '1px solid', borderColor: 'orange.200' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'orange.700', fontWeight: 'bold' }}>
              Etkilenen Birim #{index + 1}
            </Typography>
            <Grid container spacing={2} alignItems="center">
              {/* Birim Seçimi */}
              <Grid item xs={12} md={2.5}>
                <FormControl fullWidth required>
                  <InputLabel>Etkilenen Birim</InputLabel>
                  <Select
                    value={ekBirim.birimAdi || ''}
                    onChange={(e) => handleBirimChange(index, e.target.value)}
                    label="Etkilenen Birim"
                  >
                    {birimler.map(b => (
                      <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Süre */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  required
                  label={`Süre (${timeUnit})`}
                  type="number"
                  value={ekBirim.sure || 0}
                  onChange={(e) => handleSureChange(index, parseFloat(e.target.value) || 0)}
                  helperText={`${timeUnit} cinsinden`}
                />
              </Grid>

              {/* Birim Maliyet (Otomatik) */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label={`Birim Maliyet (₺/${timeUnit})`}
                  type="number"
                  value={ekBirim.birimMaliyet || 0}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>
                  }}
                  helperText="Otomatik yüklendi"
                  disabled
                  color="success"
                />
              </Grid>

              {/* Toplam Maliyet (Hesaplanan) */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Toplam Maliyet (₺)"
                  type="number"
                  value={ekBirim.maliyet || 0}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>
                  }}
                  helperText={`${ekBirim.sure || 0} × ₺${ekBirim.birimMaliyet || 0}`}
                  disabled
                  color="info"
                />
              </Grid>

              {/* Açıklama */}
              <Grid item xs={12} md={2.5}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  value={ekBirim.aciklama || ''}
                  onChange={(e) => handleAciklamaChange(index, e.target.value)}
                  placeholder="Ek işlem açıklaması"
                  multiline
                  rows={1}
                />
              </Grid>

              {/* Silme Butonu */}
              <Grid item xs={12} md={1}>
                <IconButton 
                  color="error" 
                  onClick={() => handleDelete(index)}
                  sx={{ 
                    bgcolor: 'error.50',
                    '&:hover': { bgcolor: 'error.100' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}

      {/* Yeni birim ekleme butonu */}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ 
            width: '100%',
            py: 1.5,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': {
              borderStyle: 'solid',
              bgcolor: 'primary.50'
            }
          }}
        >
          Etkilenen Birim Ekle
        </Button>
      </Grid>

      {/* Gelişmiş Toplam maliyet özeti */}
      {ekBirimMaliyetleri.length > 0 && (
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'success.50', borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Maliyet Özeti
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Ana Birim Maliyeti</Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      ₺{mainCost.toLocaleString('tr-TR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ana işlem maliyeti
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Etkilenen Birimler</Typography>
                    <Typography variant="h5" color="warning.main" fontWeight="bold">
                      ₺{totalEtkilenenMaliyet.toLocaleString('tr-TR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ekBirimMaliyetleri.length} birim etkilendi
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.100', borderRadius: 1, border: '2px solid', borderColor: 'success.main' }}>
                    <Typography variant="body2" color="success.main" fontWeight="bold">GENEL TOPLAM</Typography>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      ₺{grandTotal.toLocaleString('tr-TR')}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Ana + Etkilenen Birimler
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
};

export default EnhancedEtkilenenBirimForm; 