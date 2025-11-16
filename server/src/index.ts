import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import clientsRoutes from './routes/clientsRoutes';
import appointmentsRoutes from './routes/appointmentsRoutes';
import conversationsRoutes from './routes/conversationsRoutes';
import automationsRoutes from './routes/automationsRoutes';
import integrationsRoutes from './routes/integrationsRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import demoRoutes from './routes/demoRoutes';
import webhooksRoutes from './routes/webhooksRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import recurringRoutes from './routes/recurringRoutes';
import invoicesRoutes from './routes/invoicesRoutes';
import waitingListRoutes from './routes/waitingListRoutes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
// CORS configuration - supports multiple origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

console.log('🔐 CORS Configuration:');
console.log('   Allowed origins:', allowedOrigins.join(', '));
console.log('   CLIENT_URL env:', process.env.CLIENT_URL || 'NOT SET');

// Global request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.get('origin') || 'no origin'}`);
  next();
});

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(null, true); // TEMPORARILY ALLOW ALL to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}));

// Explicit preflight handler for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/waiting-list', waitingListRoutes);

// Health checks - both root and /api/health for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    status: 'Avizo API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clients: '/api/clients',
      appointments: '/api/appointments',
      conversations: '/api/conversations',
      automations: '/api/automations',
      analytics: '/api/analytics'
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Listen on 0.0.0.0 for Railway/Docker compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Listening on 0.0.0.0:${PORT}`);
});
