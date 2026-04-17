import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';

dotenv.config();

// Factory function: facilita crear instancias separadas para testing
export function createApp(): express.Application {
  const app = express();

  // Middlewares globales
  app.use(cors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(requestLogger);

  // Rutas
  app.use('/api/v1', apiRouter);

  // Error handler: DEBE ir último
  app.use(errorHandler);

  return app;
}
