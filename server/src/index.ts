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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
});
