import mongoose, { Document, Schema } from 'mongoose';

// Araç statü enum'ları
export enum VehicleStatus {
  PRODUCTION = 'production',
  QUALITY_CONTROL = 'quality_control',
  RETURNED_TO_PRODUCTION = 'returned_to_production',
  SERVICE = 'service',  // SERVİS adımı eklendi
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped'
}

export enum DefectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DefectStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// Eksiklik/Hata interface
export interface IDefect {
  id: string;
  description: string;
  department: string;
  responsiblePerson?: string;
  priority: DefectPriority;
  status: DefectStatus;
  detectedDate: Date;
  resolvedDate?: Date;
  notes?: string;
  images?: string[];
}

// Süreç kaydı interface
export interface IProcessRecord {
  id: string;
  status: VehicleStatus;
  date: Date;
  performedBy: string;
  performedById: mongoose.Types.ObjectId;
  notes?: string;
  reason?: string; // Üretime geri gönderme sebebi
}

// Ana araç interface
export interface IVehicleQualityControl extends Document {
  // Temel bilgiler
  vehicleName: string;
  vehicleModel: string;
  serialNumber: string;
  customerName: string;
  spsNumber: string;
  productionDate: Date;
  description?: string;
  
  // Durum bilgileri
  currentStatus: VehicleStatus;
  statusHistory: IProcessRecord[];
  
  // Eksiklikler
  defects: IDefect[];
  
  // Süreç tarihleri
  qualityEntryDate?: Date;
  productionReturnDate?: Date;
  qualityReentryDate?: Date;
  serviceStartDate?: Date;  // Servis başlangıç tarihi
  serviceEndDate?: Date;    // Servis bitiş tarihi
  shipmentReadyDate?: Date;
  shipmentDate?: Date;
  
  // Uyarı sistemi
  isOverdue: boolean;
  overdueDate?: Date;
  warningLevel: 'none' | 'warning' | 'critical';
  
  // Öncelik ve tahmin bilgileri
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCompletionDate?: Date;
  
  // Sevk bilgileri
  shipmentType?: 'normal' | 'deviation_approved';
  shipmentNotes?: string;
  
  // Timestamp'ler
  createdAt: Date;
  updatedAt: Date;
}

// Eksiklik schema
const defectSchema = new Schema<IDefect>({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  description: {
    type: String,
    required: [true, 'Eksiklik açıklaması zorunludur'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Sorumlu birim zorunludur'],
    trim: true
  },
  responsiblePerson: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: Object.values(DefectPriority),
    default: DefectPriority.MEDIUM,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(DefectStatus),
    default: DefectStatus.OPEN,
    required: true
  },
  detectedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  resolvedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }]
});

// Süreç kaydı schema
const processRecordSchema = new Schema<IProcessRecord>({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  status: {
    type: String,
    enum: Object.values(VehicleStatus),
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  performedBy: {
    type: String,
    required: [true, 'İşlemi yapan kişi zorunludur'],
    trim: true
  },
  performedById: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    trim: true
  }
});

// Ana araç schema
const vehicleQualityControlSchema = new Schema<IVehicleQualityControl>(
  {
    // Temel bilgiler
    vehicleName: {
      type: String,
      required: [true, 'Araç adı zorunludur'],
      trim: true
    },
    vehicleModel: {
      type: String,
      required: [true, 'Model zorunludur'],
      trim: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Seri numarası zorunludur'],
      unique: true,
      trim: true
    },
    customerName: {
      type: String,
      required: [true, 'Müşteri adı zorunludur'],
      trim: true
    },
    spsNumber: {
      type: String,
      required: [true, 'SPS numarası zorunludur'],
      trim: true
    },
    productionDate: {
      type: Date,
      required: [true, 'Üretim tarihi zorunludur']
    },
    description: {
      type: String,
      trim: true
    },
    
    // Durum bilgileri
    currentStatus: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.PRODUCTION,
      required: true
    },
    statusHistory: [processRecordSchema],
    
    // Eksiklikler
    defects: [defectSchema],
    
    // Süreç tarihleri
    qualityEntryDate: {
      type: Date
    },
    productionReturnDate: {
      type: Date
    },
    qualityReentryDate: {
      type: Date
    },
    serviceStartDate: {
      type: Date
    },
    serviceEndDate: {
      type: Date
    },
    shipmentReadyDate: {
      type: Date
    },
    shipmentDate: {
      type: Date
    },
    
    // Uyarı sistemi
    isOverdue: {
      type: Boolean,
      default: false
    },
    overdueDate: {
      type: Date
    },
    warningLevel: {
      type: String,
      enum: ['none', 'warning', 'critical'],
      default: 'none'
    },
    
    // Öncelik ve tahmin bilgileri
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    estimatedCompletionDate: {
      type: Date
    },
    
    // Sevk bilgileri
    shipmentType: {
      type: String,
      enum: ['normal', 'deviation_approved']
    },
    shipmentNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware - uyarı sistemini kontrol et
vehicleQualityControlSchema.pre<IVehicleQualityControl>('save', function(next) {
  // Üretime geri gönderilen araçlar için uyarı sistemi
  if (this.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION && this.productionReturnDate) {
    const daysSinceReturn = Math.floor((Date.now() - this.productionReturnDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReturn >= 2) {
      this.isOverdue = true;
      this.overdueDate = new Date(this.productionReturnDate.getTime() + (2 * 24 * 60 * 60 * 1000));
      
      if (daysSinceReturn >= 5) {
        this.warningLevel = 'critical';
      } else {
        this.warningLevel = 'warning';
      }
    }
  } else {
    this.isOverdue = false;
    this.overdueDate = undefined;
    this.warningLevel = 'none';
  }
  
  next();
});

// Indexler
vehicleQualityControlSchema.index({ serialNumber: 1 });
vehicleQualityControlSchema.index({ currentStatus: 1 });
vehicleQualityControlSchema.index({ customerName: 1 });
vehicleQualityControlSchema.index({ vehicleModel: 1 });
vehicleQualityControlSchema.index({ isOverdue: 1 });
vehicleQualityControlSchema.index({ productionDate: -1 });

export default mongoose.model<IVehicleQualityControl>('VehicleQualityControl', vehicleQualityControlSchema); 