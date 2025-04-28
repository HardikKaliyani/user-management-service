import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger.util';

/**
 * Middleware to validate user roles for access control
 * 
 * @param requiredRoles - Array of roles that are allowed to access the endpoint
 * @returns Express middleware function
 */
export const authorize = (requiredRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Check if user has required role
      if (!requiredRoles.includes(req.user.role)) {
        logger.warn('Unauthorized access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles,
          endpoint: req.originalUrl,
          method: req.method,
        });
        
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Authorization check failed',
      });
    }
  };
};

/**
 * Middleware shorthand for admin-only routes
 */
export const adminOnly = authorize([Role.ADMIN]);

/**
 * Middleware shorthand for authenticated routes (any role)
 */
export const anyUser = authorize([Role.ADMIN, Role.USER]);