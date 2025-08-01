import mongoose, { Document, Schema } from 'mongoose';

// Enums
export enum DeviationType {
  INPUT_CONTROL = 'input-control',
  PROCESS_CONTROL = 'process-control',
  FINAL_CONTROL = 'final-control'
}

export enum QualityRisk {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DeviationStatus {
  PENDING = 'pending',
  RD_APPROVED = 'rd-approved',
  QUALITY_APPROVED = 'quality-approved',
  PRODUCTION_APPROVED = 'production-approved',
  FINAL_APPROVED = 'final-approved',
  REJECTED = 'rejected'
}

// Sub-interfaces
export interface IVehicleInfo {
  id: string;
  model: string;
  serialNumber: string;
  chassisNumber?: string;
}

export interface IApprovalInfo {
  approved: boolean;
  approver: string;
  approvalDate?: Date;
  comments?: string;
}

export interface IDeviationAttachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 encoded file data
  uploadDate: Date;
  uploadedBy: string;
}

// Main interface
export interface IDeviationApproval extends Document {
  deviationNumber: string;
  partName: string;
  partNumber: string;
  vehicles: IVehicleInfo[];
  deviationType: DeviationType;
  description: string;
  reasonForDeviation?: string;
  proposedSolution?: string;
  qualityRisk: QualityRisk;
  
  // Request info
  requestDate: Date;
  requestedBy: string;
  department: string;
  
  // Approval workflow
  rdApproval: IApprovalInfo;
  qualityApproval: IApprovalInfo;
  productionApproval: IApprovalInfo;
  generalManagerApproval: IApprovalInfo;
  
  // Status and tracking
  status: DeviationStatus;
  rejectionReason?: string;
  
  // Attachments
  attachments?: IDeviationAttachment[];
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  
  // Additional tracking
  completedDate?: Date;
  totalApprovalTime?: number; // in hours
}

// Vehicle Info Schema
const VehicleInfoSchema = new Schema<IVehicleInfo>({
  id: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    trim: true
  },
  chassisNumber: {
    type: String,
    trim: true
  }
});

// Approval Info Schema
const ApprovalInfoSchema = new Schema<IApprovalInfo>({
  approved: {
    type: Boolean,
    default: false
  },
  approver: {
    type: String,
    trim: true
  },
  approvalDate: {
    type: Date
  },
  comments: {
    type: String,
    trim: true
  }
});

// Attachment Schema
const DeviationAttachmentSchema = new Schema<IDeviationAttachment>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: String,
    required: true,
    trim: true
  }
});

// Main Deviation Approval Schema
const DeviationApprovalSchema = new Schema<IDeviationApproval>({
  deviationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  partName: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  vehicles: [VehicleInfoSchema],
  deviationType: {
    type: String,
    enum: Object.values(DeviationType),
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  reasonForDeviation: {
    type: String,
    trim: true
  },
  proposedSolution: {
    type: String,
    trim: true
  },
  qualityRisk: {
    type: String,
    enum: Object.values(QualityRisk),
    required: true
  },
  
  // Request info
  requestDate: {
    type: Date,
    required: true
  },
  requestedBy: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  
  // Approval workflow
  rdApproval: {
    type: ApprovalInfoSchema,
    default: () => ({ approved: false })
  },
  qualityApproval: {
    type: ApprovalInfoSchema,
    default: () => ({ approved: false })
  },
  productionApproval: {
    type: ApprovalInfoSchema,
    default: () => ({ approved: false })
  },
  generalManagerApproval: {
    type: ApprovalInfoSchema,
    default: () => ({ approved: false })
  },
  
  // Status and tracking
  status: {
    type: String,
    enum: Object.values(DeviationStatus),
    default: DeviationStatus.PENDING,
    index: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Attachments
  attachments: [DeviationAttachmentSchema],
  
  // Audit trail
  createdBy: {
    type: String,
    required: true,
    trim: true
  },
  lastModifiedBy: {
    type: String,
    required: true,
    trim: true
  },
  
  // Additional tracking
  completedDate: {
    type: Date
  },
  totalApprovalTime: {
    type: Number // in hours
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'deviationapprovals'
});

// Indexes for better performance
DeviationApprovalSchema.index({ status: 1, department: 1 });
DeviationApprovalSchema.index({ requestDate: -1 });
DeviationApprovalSchema.index({ createdAt: -1 });
DeviationApprovalSchema.index({ 'vehicles.serialNumber': 1 });
DeviationApprovalSchema.index({ deviationType: 1 });

// Pre-save middleware to calculate approval time
DeviationApprovalSchema.pre('save', function(next) {
  if (this.status === DeviationStatus.FINAL_APPROVED && !this.completedDate) {
    this.completedDate = new Date();
    
    // Calculate total approval time in hours
    if (this.createdAt) {
      const diffMs = this.completedDate.getTime() - this.createdAt.getTime();
      this.totalApprovalTime = Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
    }
  }
  next();
});

// Static methods
DeviationApprovalSchema.statics.findByStatus = function(status: DeviationStatus) {
  return this.find({ status });
};

DeviationApprovalSchema.statics.findByDepartment = function(department: string) {
  return this.find({ department });
};

DeviationApprovalSchema.statics.findPendingApprovals = function() {
  return this.find({ status: { $ne: DeviationStatus.FINAL_APPROVED } });
};

// Instance methods
DeviationApprovalSchema.methods.approve = function(approvalType: string, approver: string, comments?: string) {
  const approvalField = `${approvalType}Approval`;
  if (this[approvalField]) {
    this[approvalField].approved = true;
    this[approvalField].approver = approver;
    this[approvalField].approvalDate = new Date();
    if (comments) {
      this[approvalField].comments = comments;
    }
    
    // Update status based on approval progression
    this.updateStatus();
  }
};

DeviationApprovalSchema.methods.reject = function(reason: string, rejectedBy: string) {
  this.status = DeviationStatus.REJECTED;
  this.rejectionReason = reason;
  this.lastModifiedBy = rejectedBy;
};

DeviationApprovalSchema.methods.updateStatus = function() {
  if (this.generalManagerApproval.approved) {
    this.status = DeviationStatus.FINAL_APPROVED;
  } else if (this.productionApproval.approved) {
    this.status = DeviationStatus.PRODUCTION_APPROVED;
  } else if (this.qualityApproval.approved) {
    this.status = DeviationStatus.QUALITY_APPROVED;
  } else if (this.rdApproval.approved) {
    this.status = DeviationStatus.RD_APPROVED;
  } else {
    this.status = DeviationStatus.PENDING;
  }
};

// Create and export model
const DeviationApprovalModel = mongoose.model<IDeviationApproval>('DeviationApproval', DeviationApprovalSchema);

export default DeviationApprovalModel;
export { DeviationApprovalModel };