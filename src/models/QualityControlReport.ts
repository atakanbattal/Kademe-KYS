import mongoose, { Schema, Document } from 'mongoose';

export interface IQualityControlReport extends Document {
  reportId: string;
  materialQualityControlId: mongoose.Types.ObjectId;
  reportType: 'INPUT_QUALITY_CONTROL';
  materialCode: string;
  materialName: string;
  supplierName: string;
  batchNumber: string;
  certificateNumber?: string;
  testOperator: {
    id: string;
    name: string;
    employeeId: string;
  };
  qualityController: {
    id: string;
    name: string;
    employeeId: string;
  };
  overallQualityGrade: 'B' | 'C' | 'D' | 'REJECT';
  standardReference: string;
  testResults: {
    chemicalComposition?: Record<string, number>;
    mechanicalProperties?: Record<string, number>;
    hardnessValues?: Record<string, number>;
    validationResults?: {
      status: 'ACCEPTED' | 'REJECTED';
      details: Array<{
        property: string;
        value: string;
        requirement: string;
        status: 'ACCEPTED' | 'REJECTED';
        reference: string;
      }>;
    };
  };
  conclusion: string;
  pdfPath?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const qualityControlReportSchema = new Schema<IQualityControlReport>(
  {
    reportId: {
      type: String,
      required: [true, 'Report ID is required'],
      unique: true,
      trim: true,
    },
    materialQualityControlId: {
      type: Schema.Types.ObjectId,
      ref: 'MaterialQualityControl',
      required: [true, 'Material Quality Control ID is required'],
    },
    reportType: {
      type: String,
      required: true,
      enum: ['INPUT_QUALITY_CONTROL'],
      default: 'INPUT_QUALITY_CONTROL',
    },
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
    certificateNumber: {
      type: String,
      trim: true,
    },
    testOperator: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      employeeId: {
        type: String,
        required: true,
      },
    },
    qualityController: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      employeeId: {
        type: String,
        required: true,
      },
    },
    overallQualityGrade: {
      type: String,
      required: [true, 'Overall quality grade is required'],
      enum: ['B', 'C', 'D', 'REJECT'],
    },
    standardReference: {
      type: String,
      required: [true, 'Standard reference is required'],
      trim: true,
    },
    testResults: {
      chemicalComposition: {
        type: Schema.Types.Mixed,
      },
      mechanicalProperties: {
        type: Schema.Types.Mixed,
      },
      hardnessValues: {
        type: Schema.Types.Mixed,
      },
      validationResults: {
        status: {
          type: String,
          enum: ['ACCEPTED', 'REJECTED'],
        },
        details: [{
          property: String,
          value: String,
          requirement: String,
          status: {
            type: String,
            enum: ['ACCEPTED', 'REJECTED'],
          },
          reference: String,
        }],
      },
    },
    conclusion: {
      type: String,
      required: [true, 'Conclusion is required'],
      trim: true,
    },
    pdfPath: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique report ID before saving
qualityControlReportSchema.pre('save', async function (next) {
  if (!this.reportId) {
    const count = await mongoose.model('QualityControlReport').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.reportId = `QCR-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IQualityControlReport>('QualityControlReport', qualityControlReportSchema); 