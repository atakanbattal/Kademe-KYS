import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import config from './config/default';

// Import routes
import authRoutes from './routes/authRoutes';
import materialQualityControlRoutes from './routes/materialQualityControlRoutes';
import tankLeakTestRoutes from './routes/tankLeakTestRoutes';
import qualityControlReportRoutes from './routes/qualityControlReportRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = config.port || process.env.PORT || 5000;

// CORS Configuration for production
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3005'];

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Kademe KYS Backend',
    version: '1.0.0'
  });
});

// Basic API info
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kademe A.Ş. Kalite Yönetim Sistemi API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      materialQuality: '/api/material-quality',
      tankLeakTest: '/api/tank-leak-test',
      qualityReports: '/api/quality-control-reports'
    }
  });
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan logging - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/material-quality', materialQualityControlRoutes);
app.use('/api/tank-leak-test', tankLeakTestRoutes);
app.use('/api/quality-control-reports', qualityControlReportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} endpoint bulunamadı`,
    availableEndpoints: ['/health', '/api/auth', '/api/material-quality', '/api/tank-leak-test', '/api/quality-control-reports']
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    error: true,
    message: err.message || 'Bir hata oluştu',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    timestamp: new Date().toISOString()
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

// Start server with better error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Kademe KYS Backend Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Endpoints: http://localhost:${PORT}/api`);
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

export default app; 