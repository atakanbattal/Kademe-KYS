import mongoose, { Document, Schema } from 'mongoose';

// Supplier document interface
export interface ISupplier extends Document {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  materialCategories: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier schema
const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Supplier code is required'],
      unique: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    materialCategories: {
      type: [String],
      required: [true, 'Material categories are required'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISupplier>('Supplier', supplierSchema); 