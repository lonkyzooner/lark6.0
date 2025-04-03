// Vercel API endpoint for health check
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://lark-law.com']
    : '*',
  methods: ['GET', 'HEAD'],
  allowedHeaders: ['Content-Type']
}));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Detailed health check endpoint
app.get('/api/health/detailed', async (req, res) => {
  const services = {
    api: { status: 'ok' },
    openai: { status: 'unknown' }
  };

  // Check OpenAI API
  try {
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Make a simple API call to check if OpenAI is working
      await openai.models.list();
      services.openai.status = 'ok';
    } else {
      services.openai.status = 'not_configured';
    }
  } catch (error) {
    services.openai.status = 'error';
    services.openai.message = error.message;
  }

  // Determine overall status
  const overallStatus = Object.values(services).some(s => s.status === 'error') ? 'degraded' : 'ok';

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services
  });
});

// Export for Vercel serverless functions
module.exports = app;
