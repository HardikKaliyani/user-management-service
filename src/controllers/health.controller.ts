import { Request, Response } from 'express';
import prisma from '../config/database.config';
import logger from '../utils/logger.util';

/**
 * Health controller for health check endpoint
 */
class HealthController {
  /**
   * Get health status of the service
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      let databaseStatus = 'ok';
      let databaseMessage = 'Connected to database';
      
      try {
        // Execute a simple query to check database connection
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        databaseStatus = 'error';
        databaseMessage = 'Database connection failed';
        logger.error('Health check failed:', { error });
      }

      // Calculate uptime
      const uptimeInSeconds = process.uptime();
      
      res.status(200).json({
        status: 'success',
        message: 'Health check successful',
        data: {
          status: databaseStatus === 'ok' ? 'ok' : 'error',
          uptime: uptimeInSeconds,
          timestamp: new Date(),
          database: {
            status: databaseStatus,
            message: databaseMessage,
          },
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error) {
      logger.error('Health check error:', { error });
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        data: {
          status: 'error',
          uptime: process.uptime(),
          timestamp: new Date(),
          database: {
            status: 'error',
            message: 'Health check encountered an error',
          },
        },
      });
    }
  }
}

export default new HealthController();