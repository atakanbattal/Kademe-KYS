import { config } from 'dotenv';

// Load environment variables
config();

export default {
  port: process.env.PORT || 5003,
  // MongoDB configuration (deprecated - migrating to Supabase)
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kys',
  // Supabase configuration
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'kys_secret_key_change_in_production',
  nodeEnv: process.env.NODE_ENV || 'development',
}; 