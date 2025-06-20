import mongoose, { Document, Schema } from 'mongoose';

// Material Quality Control status
export enum QualityControlStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL = 'conditional'
}

// Certificate properties interface
interface ICertificateProperty {
  name: string;
  expectedValue: string;
  actualValue: string;
  tolerance?: number;
  unit?: string;
  isCompliant: boolean;
}

// Material Quality Control document interface
export interface IMaterialQualityControl extends Document {
  materialCode: string;
  materialName: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  batchNumber: string;
  receivedDate: Date;
  inspectionDate: Date;
  inspector: mongoose.Types.ObjectId;
  certificateNumber?: string;
  certificateUploadPath?: string;
  certificateProperties: ICertificateProperty[];
  visualInspectionNotes?: string;
  dimensionalInspectionNotes?: string;
  status: QualityControlStatus;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Certificate property schema
const certificatePropertySchema = new Schema<ICertificateProperty>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  expectedValue: {
    type: String,
    required: true,
    trim: true,
  },
  actualValue: {
    type: String,
    required: true,
    trim: true,
  },
  tolerance: {
    type: Number,
  },
  unit: {
    type: String,
    trim: true,
  },
  isCompliant: {
    type: Boolean,
    required: true,
  },
});

// Material Quality Control schema
const materialQualityControlSchema = new Schema<IMaterialQualityControl>(
  {
    materialCode: {
      type: String,
      required: [true, 'Material code is required'],
      trim: true,
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
    },
    receivedDate: {
      type: Date,
      required: [true, 'Received date is required'],
    },
    inspectionDate: {
      type: Date,
      required: [true, 'Inspection date is required'],
      default: Date.now,
    },
    inspector: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector is required'],
    },
    certificateNumber: {
      type: String,
      trim: true,
    },
    certificateUploadPath: {
      type: String,
      trim: true,
    },
    certificateProperties: [certificatePropertySchema],
    visualInspectionNotes: {
      type: String,
      trim: true,
    },
    dimensionalInspectionNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(QualityControlStatus),
      default: QualityControlStatus.PENDING,
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for unique material-batch combination per supplier
materialQualityControlSchema.index(
  { supplierId: 1, materialCode: 1, batchNumber: 1 },
  { unique: true }
);

export default mongoose.model<IMaterialQualityControl>('MaterialQualityControl', materialQualityControlSchema); 