import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import config from './config/default';
import { testConnection } from './utils/supabaseDb';

// Import routes
import authRoutes from './routes/authRoutes';
import materialQualityControlRoutes from './routes/materialQualityControlRoutes';
import tankLeakTestRoutes from './routes/tankLeakTestRoutes';
import qualityControlReportRoutes from './routes/qualityControlReportRoutes';
import vehicleQualityControlRoutes from './routes/vehicleQualityControlRoutes';
import deviationApprovalRoutes from './routes/deviationApprovalRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = config.port || process.env.PORT || 5003;

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Entegre Kalite Yönetim Sistemi API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/material-quality', materialQualityControlRoutes);
app.use('/api/tank-leak-test', tankLeakTestRoutes);
app.use('/api/quality-control-reports', qualityControlReportRoutes);
app.use('/api/vehicle-quality-control', vehicleQualityControlRoutes);
app.use('/api/deviation-approvals', deviationApprovalRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Test Supabase connection first
    console.log('🔄 Testing Supabase connection...');
    const isConnected = await testConnection();
    
    if (!isConnected && process.env.NODE_ENV === 'production') {
      console.error('❌ Failed to connect to Supabase in production mode');
      process.exit(1);
    } else if (!isConnected) {
      console.warn('⚠️ Supabase connection failed, but continuing in development mode');
    }
    
    // Start server with better error handling
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please use a different port or stop the existing process.`);
        console.log(`💡 You can kill the process using: lsof -ti:${PORT} | xargs kill -9`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app; 