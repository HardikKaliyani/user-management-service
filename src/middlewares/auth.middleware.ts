import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';
import logger from '../utils/logger.util';

/**
 * Middleware to authenticate requests using JWT
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header is missing',
      });
    }

    // Parse token from header
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authorization format',
      });
    }

    const token = parts[1];

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', { error });
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
};