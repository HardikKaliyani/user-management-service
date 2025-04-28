import { Request } from 'express';
import { Role } from '@prisma/client';

// Extend the Express Request type to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// API Response interface
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: any[];
}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: Date;
  database: {
    status: 'ok' | 'error';
    message?: string;
  };
}

// Error response
export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: any[];
}