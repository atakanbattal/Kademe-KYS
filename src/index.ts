import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { connectDB } from './utils/db';
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
const PORT = config.port || process.env.PORT || 5003;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3005',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Kalite Yönetim Sistemi API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      materialQuality: '/api/material-quality',
      tankLeakTest: '/api/tank-leak-test',
      qualityControlReports: '/api/quality-control-reports'
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kalite Yönetim Sistemi API',
    version: '1.0.0',
    documentation: '/api/status'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/material-quality', materialQualityControlRoutes);
app.use('/api/tank-leak-test', tankLeakTestRoutes);
app.use('/api/quality-control-reports', qualityControlReportRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  // Force close server after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server with better error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Local MongoDB'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3005'}`);
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