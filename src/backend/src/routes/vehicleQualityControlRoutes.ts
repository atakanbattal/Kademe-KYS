import express from 'express';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleStatus,
  addDefect,
  updateDefect,
  updateVehicle,
  deleteVehicle,
  getDashboardStats,
  getWarnings,
  getWarningSettings,
  updateWarningSettings
} from '../controllers/vehicleQualityControlController';

const router = express.Router();

// Dashboard ve istatistikler
router.get('/dashboard', getDashboardStats);
router.get('/warnings', getWarnings);

// Uyarı ayarları
router.get('/warning-settings', getWarningSettings);
router.put('/warning-settings', updateWarningSettings);

// Ana araç işlemleri
router.get('/', getAllVehicles);
router.post('/', createVehicle);
router.get('/:id', getVehicleById);
router.patch('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Durum güncellemeleri
router.patch('/:id/status', updateVehicleStatus);

// Eksiklik yönetimi
router.post('/:id/defects', addDefect);
router.patch('/:id/defects/:defectId', updateDefect);

export default router; 