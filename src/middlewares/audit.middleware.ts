import { Response, NextFunction } from 'express';
import prisma from '../config/database.config';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger.util';

/**
 * Middleware to log API requests to the audit log
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const auditLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Save original send function
  const originalSend = res.send;
  
  // Get request details
  const userId = req.user?.id;
  const endpoint = req.originalUrl;
  const method = req.method;
  const requestBody = req.method !== 'GET' ? req.body : null;
  const ipAddress = req.ip || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;
  
  // Capture response status and body
  let responseStatus = 200;

  // Override send function to capture response status
  res.send = function(body: any): Response {
    responseStatus = res.statusCode;
    
    // Create audit log entry
    try {
      // Don't log health checks to reduce noise
      if (endpoint !== '/api/v1/health' && !endpoint.includes('/api/v1/docs')) {
        prisma.auditLog.create({
          data: {
            userId,
            endpoint,
            method,
            requestBody: requestBody ? JSON.parse(JSON.stringify(requestBody)) : null,
            responseStatus,
            ipAddress,
            userAgent,
          },
        }).catch(error => {
          logger.error('Error creating audit log:', { error });
        });
      }
    } catch (error) {
      logger.error('Error in audit logging middleware:', { error });
    }
    
    // Call original send
    return originalSend.call(this, body);
  };
  
  next();
};