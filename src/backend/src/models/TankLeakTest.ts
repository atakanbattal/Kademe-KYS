import mongoose, { Document, Schema } from 'mongoose';

// Tank Leak Test status
export enum TankLeakTestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PENDING = 'pending'
}

// Tank Leak Test document interface
export interface ITankLeakTest extends Document {
  tankId: string;
  tankType: string;
  testType: string;
  materialType: string;
  welderId: mongoose.Types.ObjectId;
  welderName: string;
  qualityInspectorId: mongoose.Types.ObjectId;
  qualityInspectorName: string;
  testDate: Date;
  testPressure: number;
  pressureUnit: string;
  testDuration: number;
  durationUnit: string;
  initialPressure: number;
  finalPressure: number;
  pressureDrop: number;
  maxAllowedPressureDrop: number;
  temperature: number;
  temperatureUnit: string;
  humidity: number;
  status: TankLeakTestStatus;
  notes?: string;
  imageUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Tank Leak Test schema
const tankLeakTestSchema = new Schema<ITankLeakTest>(
  {
    tankId: {
      type: String,
      required: [true, 'Tank ID is required'],
      trim: true,
    },
    tankType: {
      type: String,
      required: [true, 'Tank type is required'],
      trim: true,
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true,
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      trim: true,
    },
    welderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Welder ID is required'],
    },
    welderName: {
      type: String,
      required: [true, 'Welder name is required'],
      trim: true,
    },
    qualityInspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Quality inspector ID is required'],
    },
    qualityInspectorName: {
      type: String,
      required: [true, 'Quality inspector name is required'],
      trim: true,
    },
    testDate: {
      type: Date,
      required: [true, 'Test date is required'],
      default: Date.now,
    },
    testPressure: {
      type: Number,
      required: [true, 'Test pressure is required'],
    },
    pressureUnit: {
      type: String,
      required: [true, 'Pressure unit is required'],
      default: 'bar',
      trim: true,
    },
    testDuration: {
      type: Number,
      required: [true, 'Test duration is required'],
    },
    durationUnit: {
      type: String,
      required: [true, 'Duration unit is required'],
      default: 'minutes',
      trim: true,
    },
    initialPressure: {
      type: Number,
      required: [true, 'Initial pressure is required'],
    },
    finalPressure: {
      type: Number,
      required: [true, 'Final pressure is required'],
    },
    pressureDrop: {
      type: Number,
      required: [true, 'Pressure drop is required'],
    },
    maxAllowedPressureDrop: {
      type: Number,
      required: [true, 'Maximum allowed pressure drop is required'],
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
    },
    temperatureUnit: {
      type: String,
      required: [true, 'Temperature unit is required'],
      default: '°C',
      trim: true,
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity is required'],
    },
    status: {
      type: String,
      enum: Object.values(TankLeakTestStatus),
      default: TankLeakTestStatus.PENDING,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    imageUrls: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Calculate pressure drop automatically before saving
tankLeakTestSchema.pre('save', function(next) {
  if (this.initialPressure && this.finalPressure) {
    this.pressureDrop = this.initialPressure - this.finalPressure;
  }
  
  // Determine test status
  if (this.pressureDrop <= this.maxAllowedPressureDrop) {
    this.status = TankLeakTestStatus.PASSED;
  } else {
    this.status = TankLeakTestStatus.FAILED;
  }
  
  next();
});

export default mongoose.model<ITankLeakTest>('TankLeakTest', tankLeakTestSchema); 