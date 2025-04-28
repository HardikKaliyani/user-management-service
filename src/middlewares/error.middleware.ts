import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  errors?: any[];

  constructor(statusCode: number, message: string, code?: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * 
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      status: 'error',
      message: 'Database operation failed',
      errors: [err.message],
    });
  }

  // Default error response for unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

/**
 * Middleware to handle 404 Not Found errors
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found:', { 
    url: req.originalUrl, 
    method: req.method 
  });
  
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};