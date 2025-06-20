const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kys', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Health check endpoint
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'netlify-functions'
  });
});

// API status endpoint
app.get('/.netlify/functions/api/status', (req, res) => {
  res.json({
    message: 'Kalite Yönetim Sistemi API',
    version: '1.0.0',
    platform: 'Netlify Functions',
    status: 'active'
  });
});

// Basic user routes
app.get('/.netlify/functions/api/users', async (req, res) => {
  try {
    // Mock response for now
    res.json([
      { id: 1, name: 'Atakan Battal', role: 'admin' },
      { id: 2, name: 'Test User', role: 'quality' }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quality data routes
app.get('/.netlify/functions/api/quality-data', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      totalRecords: 150,
      totalCost: 125000,
      avgCost: 833,
      currentMonth: {
        records: 25,
        cost: 18500
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Export the serverless function
module.exports.handler = serverless(app); 