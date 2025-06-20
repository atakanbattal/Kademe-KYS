import { config } from 'dotenv';

// Load environment variables
config();

export default {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kys',
  jwtSecret: process.env.JWT_SECRET || 'kys_secret_key_change_in_production',
  nodeEnv: process.env.NODE_ENV || 'development',
}; 