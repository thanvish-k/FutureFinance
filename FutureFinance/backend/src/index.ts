import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { testConnection, isUsingPostgres } from './config/db.js';
import { initializeDatabase } from './services/dbInitService.js';
import apiRouter from './routes/api.js';

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'FutureFinance PERN Decision Intelligence',
    version: '1.0.0',
    database: isUsingPostgres() ? 'Local PostgreSQL (Active)' : 'Local Embedded Engine (Active)'
  });
});

// Mount API Routes
app.use('/api', apiRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ detail: 'Endpoint not found' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ detail: err.message || 'Internal Server Error' });
});

// Server Initialization
async function startServer() {
  console.log(`[FutureFinance] Initializing PERN Backend on port ${env.PORT}...`);
  await testConnection();
  await initializeDatabase();

  app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 FutureFinance PERN API running at http://localhost:${env.PORT}`);
    console.log(`📊 Health Endpoint: http://localhost:${env.PORT}/health`);
    console.log(`🔒 Authentication: /api/auth/login & /api/auth/register`);
    console.log(`🗄️ Database Mode: ${isUsingPostgres() ? 'Local PostgreSQL' : 'Local Standalone'}`);
    console.log(`=======================================================`);
  });
}

startServer();
