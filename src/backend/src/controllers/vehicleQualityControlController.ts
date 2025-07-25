import { Request, Response } from 'express';
import mongoose from 'mongoose';
import VehicleQualityControl, { VehicleStatus, DefectPriority, DefectStatus, IDefect } from '../models/VehicleQualityControl';
import User from '../models/User';

// Helper function to create a valid ObjectId or use system ObjectId
const getValidObjectId = (userId: string | null): mongoose.Types.ObjectId => {
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return new mongoose.Types.ObjectId(userId);
  }
  // Create a special system ObjectId
  return new mongoose.Types.ObjectId('000000000000000000000000');
};

// Yeni araç oluştur
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      vehicleName,
      vehicleModel,
      serialNumber,
      customerName,
      spsNumber,
      productionDate,
      description,
      priority
    } = req.body;

    // Seri numarası benzersizlik kontrolü
    const existingVehicle = await VehicleQualityControl.findOne({ serialNumber });
    if (existingVehicle) {
      res.status(400).json({
        success: false,
        message: 'Bu seri numarası zaten kullanılmaktadır'
      });
      return;
    }

    // Kullanıcı bilgisi al
    const userId = (req as any).user?.id || null;
    let userName = 'Sistem';
    
    if (userId) {
      try {
        const user = await User.findById(userId);
        userName = user?.name || 'Sistem';
      } catch (error) {
        console.warn('User lookup failed, using system user');
      }
    }

    // Yeni araç oluştur
    const vehicle = await VehicleQualityControl.create({
      vehicleName,
      vehicleModel,
      serialNumber,
      customerName,
      spsNumber,
      productionDate: new Date(productionDate),
      description,
      priority: priority || 'medium',
      currentStatus: VehicleStatus.PRODUCTION,
      statusHistory: [{
        id: new Date().getTime().toString(),
        status: VehicleStatus.PRODUCTION,
        date: new Date(),
        performedBy: userName,
        performedById: getValidObjectId(userId),
        notes: 'Araç sisteme eklendi'
      }],
      defects: []
    });

    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Araç başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Araç oluşturulurken hata oluştu'
    });
  }
};

// Tüm araçları getir
export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    // Filtreleme parametreleri
    const filter: any = {};
    
    if (req.query.status) {
      filter.currentStatus = req.query.status;
    }
    
    if (req.query.customerName) {
      filter.customerName = { $regex: req.query.customerName, $options: 'i' };
    }
    
    if (req.query.vehicleModel) {
      filter.vehicleModel = { $regex: req.query.vehicleModel, $options: 'i' };
    }
    
    if (req.query.serialNumber) {
      filter.serialNumber = { $regex: req.query.serialNumber, $options: 'i' };
    }
    
    if (req.query.isOverdue === 'true') {
      filter.isOverdue = true;
    }

    // Tarih aralığı filtresi
    if (req.query.startDate && req.query.endDate) {
      filter.productionDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    // Sayfalama
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Sıralama
    const sortField = req.query.sortBy as string || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortField] = sortOrder;

    // Toplam sayı
    const total = await VehicleQualityControl.countDocuments(filter);

    // Araçları getir
    const vehicles = await VehicleQualityControl.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-statusHistory -defects'); // Detay verilerini ilk listede gösterme

    res.status(200).json({
      success: true,
      count: vehicles.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: vehicles
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Araçlar getirilirken hata oluştu'
    });
  }
};

// Araç detayını getir
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await VehicleQualityControl.findById(req.params.id)
      .populate('statusHistory.performedById', 'name');

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Araç detayı getirilirken hata oluştu'
    });
  }
};

// Araç durumunu güncelle
export const updateVehicleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes, reason } = req.body;
    
    // Kullanıcı bilgisi al
    const userId = (req as any).user?.id || null;
    let userName = 'Sistem';
    
    if (userId) {
      try {
        const user = await User.findById(userId);
        userName = user?.name || 'Sistem';
      } catch (error) {
        console.warn('User lookup failed, using system user');
      }
    }

    const vehicle = await VehicleQualityControl.findById(req.params.id);
    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
      return;
    }

    // Durum geçişlerini kontrol et
    const validTransitions: Record<string, string[]> = {
      [VehicleStatus.PRODUCTION]: [VehicleStatus.QUALITY_CONTROL],
      [VehicleStatus.QUALITY_CONTROL]: [VehicleStatus.RETURNED_TO_PRODUCTION, VehicleStatus.READY_FOR_SHIPMENT],
      [VehicleStatus.RETURNED_TO_PRODUCTION]: [VehicleStatus.QUALITY_CONTROL],
      [VehicleStatus.READY_FOR_SHIPMENT]: [VehicleStatus.SHIPPED, VehicleStatus.QUALITY_CONTROL],
      [VehicleStatus.SHIPPED]: []
    };

    if (!validTransitions[vehicle.currentStatus].includes(status)) {
      res.status(400).json({
        success: false,
        message: `${vehicle.currentStatus} durumundan ${status} durumuna geçiş yapılamaz`
      });
      return;
    }

    // Durum geçişine göre tarihleri güncelle
    const updateData: any = {
      currentStatus: status
    };

    switch (status) {
      case VehicleStatus.QUALITY_CONTROL:
        if (vehicle.currentStatus === VehicleStatus.PRODUCTION) {
          updateData.qualityEntryDate = new Date();
        } else if (vehicle.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION) {
          updateData.qualityReentryDate = new Date();
        }
        break;
      case VehicleStatus.RETURNED_TO_PRODUCTION:
        updateData.productionReturnDate = new Date();
        break;
      case VehicleStatus.READY_FOR_SHIPMENT:
        updateData.shipmentReadyDate = new Date();
        break;
      case VehicleStatus.SHIPPED:
        updateData.shipmentDate = new Date();
        break;
    }

    // Durum geçmişini güncelle
    const newStatusRecord = {
      id: new Date().getTime().toString(),
      status: status,
      date: new Date(),
      performedBy: userName,
      performedById: getValidObjectId(userId),
      notes: notes || '',
      reason: reason || ''
    };

    const updatedVehicle = await VehicleQualityControl.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        $push: { statusHistory: newStatusRecord }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedVehicle,
      message: 'Araç durumu başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Araç durumu güncellenirken hata oluştu'
    });
  }
};

// Eksiklik ekle
export const addDefect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, department, responsiblePerson, priority, notes, images } = req.body;

    const vehicle = await VehicleQualityControl.findById(req.params.id);
    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
      return;
    }

    const newDefect: IDefect = {
      id: new Date().getTime().toString(),
      description,
      department,
      responsiblePerson,
      priority: priority || DefectPriority.MEDIUM,
      status: DefectStatus.OPEN,
      detectedDate: new Date(),
      notes,
      images: images || []
    };

    vehicle.defects.push(newDefect);
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Eksiklik başarıyla eklendi'
    });
  } catch (error) {
    console.error('Add defect error:', error);
    res.status(500).json({
      success: false,
      message: 'Eksiklik eklenirken hata oluştu'
    });
  }
};

// Eksiklik güncelle
export const updateDefect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { defectId } = req.params;
    const { status, notes, resolvedDate } = req.body;

    const vehicle = await VehicleQualityControl.findById(req.params.id);
    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
      return;
    }

    const defectIndex = vehicle.defects.findIndex(d => d.id === defectId);
    if (defectIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Eksiklik bulunamadı'
      });
      return;
    }

    // Eksikliği güncelle
    if (status) vehicle.defects[defectIndex].status = status;
    if (notes) vehicle.defects[defectIndex].notes = notes;
    if (resolvedDate) vehicle.defects[defectIndex].resolvedDate = new Date(resolvedDate);
    if (status === DefectStatus.RESOLVED && !vehicle.defects[defectIndex].resolvedDate) {
      vehicle.defects[defectIndex].resolvedDate = new Date();
    }

    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Eksiklik başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({
      success: false,
      message: 'Eksiklik güncellenirken hata oluştu'
    });
  }
};

// Araç güncelle
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      vehicleName,
      vehicleModel,
      customerName,
      spsNumber,
      productionDate,
      description
    } = req.body;

    const updateData: any = {};
    if (vehicleName) updateData.vehicleName = vehicleName;
    if (vehicleModel) updateData.vehicleModel = vehicleModel;
    if (customerName) updateData.customerName = customerName;
    if (spsNumber) updateData.spsNumber = spsNumber;
    if (productionDate) updateData.productionDate = new Date(productionDate);
    if (description !== undefined) updateData.description = description;

    const vehicle = await VehicleQualityControl.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Araç başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Araç güncellenirken hata oluştu'
    });
  }
};

// Araç sil
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await VehicleQualityControl.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Araç başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Araç silinirken hata oluştu'
    });
  }
};

// Dashboard istatistikleri
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Promise.all([
      // Durum bazında sayılar
      VehicleQualityControl.countDocuments({ currentStatus: VehicleStatus.PRODUCTION }),
      VehicleQualityControl.countDocuments({ currentStatus: VehicleStatus.QUALITY_CONTROL }),
      VehicleQualityControl.countDocuments({ currentStatus: VehicleStatus.RETURNED_TO_PRODUCTION }),
      VehicleQualityControl.countDocuments({ currentStatus: VehicleStatus.READY_FOR_SHIPMENT }),
      VehicleQualityControl.countDocuments({ currentStatus: VehicleStatus.SHIPPED }),
      
      // Uyarı sayıları
      VehicleQualityControl.countDocuments({ isOverdue: true }),
      VehicleQualityControl.countDocuments({ warningLevel: 'warning' }),
      VehicleQualityControl.countDocuments({ warningLevel: 'critical' }),
      
      // Toplam eksiklik sayısı
      VehicleQualityControl.aggregate([
        { $unwind: '$defects' },
        { $match: { 'defects.status': { $in: [DefectStatus.OPEN, DefectStatus.IN_PROGRESS] } } },
        { $count: 'total' }
      ])
    ]);

    const dashboardData = {
      totalVehicles: stats[0] + stats[1] + stats[2] + stats[3] + stats[4],
      inProduction: stats[0],
      inQualityControl: stats[1],
      returnedToProduction: stats[2],
      readyForShipment: stats[3],
      shipped: stats[4],
      overdueVehicles: stats[5],
      criticalDefects: stats[6] + stats[7], // warning + critical
      avgQualityTime: 24, // Örnek veri
      avgProductionTime: 48, // Örnek veri
      monthlyShipped: stats[4], // Basit hesaplama
      qualityEfficiency: Math.round(((stats[0] + stats[1] + stats[2] + stats[3] + stats[4] - stats[5]) / Math.max(stats[0] + stats[1] + stats[2] + stats[3] + stats[4], 1)) * 100)
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri getirilirken hata oluştu'
    });
  }
};

// Uyarı listesi
export const getWarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const warnings = await VehicleQualityControl.find({
      $or: [
        { isOverdue: true },
        { warningLevel: { $in: ['warning', 'critical'] } }
      ]
    }).select('vehicleName vehicleModel serialNumber customerName currentStatus isOverdue warningLevel overdueDate productionReturnDate');

    const formattedWarnings = warnings.map(vehicle => ({
      id: vehicle._id.toString(),
      vehicleId: vehicle._id.toString(),
      vehicleName: vehicle.vehicleName,
      serialNumber: vehicle.serialNumber,
      type: vehicle.isOverdue ? 'overdue' : 'defect',
      message: vehicle.isOverdue 
        ? `${vehicle.vehicleName} üretime dönüş süresi aşıldı`
        : `${vehicle.vehicleName} kritik eksiklik mevcut`,
      level: vehicle.warningLevel === 'critical' ? 'critical' : 'warning',
      createdAt: vehicle.overdueDate || vehicle.updatedAt,
      acknowledged: false
    }));

    res.status(200).json({
      success: true,
      data: formattedWarnings
    });
  } catch (error) {
    console.error('Get warnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Uyarılar getirilirken hata oluştu'
    });
  }
};

// Uyarı ayarları - basit localStorage tabanlı yaklaşım
export const getWarningSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Gerçek uygulamada bu ayarlar veritabanında saklanır
    // Şimdilik default ayarları döndürüyoruz
    const defaultSettings = [
      {
        id: 'production_return_overdue',
        name: 'Üretime Dönüş Gecikmesi',
        description: 'Kaliteden üretime dönen araçların belirlenen süre içinde kaliteye dönmemesi',
        enabled: true,
        threshold: 2,
        unit: 'days',
        alertLevel: 'warning',
        condition: 'overdue'
      },
      {
        id: 'quality_control_pending',
        name: 'Kalite Kontrolde Bekleyen',
        description: 'Kalite kontrolde uzun süre bekleyen araçlar',
        enabled: true,
        threshold: 24,
        unit: 'hours',
        alertLevel: 'info',
        condition: 'pending'
      },
      {
        id: 'critical_defects',
        name: 'Kritik Eksiklikler',
        description: 'Kritik öncelikli eksikliklerin çözülememesi',
        enabled: true,
        threshold: 12,
        unit: 'hours',
        alertLevel: 'critical',
        condition: 'stalled'
      }
    ];

    res.status(200).json({
      success: true,
      data: defaultSettings
    });
  } catch (error) {
    console.error('Get warning settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Uyarı ayarları getirilirken hata oluştu'
    });
  }
};

export const updateWarningSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;
    
    // Gerçek uygulamada bu ayarlar veritabanında saklanır
    // Şimdilik başarılı response döndürüyoruz
    
    res.status(200).json({
      success: true,
      message: 'Uyarı ayarları başarıyla güncellendi',
      data: settings
    });
  } catch (error) {
    console.error('Update warning settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Uyarı ayarları güncellenirken hata oluştu'
    });
  }
}; 