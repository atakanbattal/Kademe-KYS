import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let mongoServer: MongoMemoryServer | null = null;

// Database connection function
export const connectDB = async (): Promise<void> => {
  try {
    // Development/Test ortamında in-memory MongoDB kullan
    if (process.env.NODE_ENV !== 'production') {
      console.log('Starting in-memory MongoDB for development...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ In-memory MongoDB connected successfully');
    } else {
      // Production ortamında gerçek MongoDB kullan
      const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kys';
      await mongoose.connect(mongodbUri);
      console.log('✅ MongoDB connected successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 For development, using in-memory database. For production, please ensure MongoDB is running.');
    
    // Development ortamında hata vermesin, in-memory kullan
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Falling back to in-memory database...');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('✅ Fallback in-memory MongoDB connected successfully');
      } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Close database connection
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
}; 