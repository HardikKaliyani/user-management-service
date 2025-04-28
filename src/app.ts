import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/app.config';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { auditLog } from './middlewares/audit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import auditRoutes from './routes/audit.routes';
import healthRoutes from './routes/health.routes';

// Create Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// Logging middleware
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Apply audit logging to all routes except health checks
app.use((req, res, next) => {
  if (!req.path.includes('/health')) {
    auditLog(req, res, next);
  } else {
    next();
  }
});

// API routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/users`, userRoutes);
app.use(`${config.apiPrefix}/audit-logs`, auditRoutes);
app.use(`${config.apiPrefix}/health`, healthRoutes);

// Catch 404 routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;