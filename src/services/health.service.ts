import prisma from '../config/database.config';
import { HealthCheckResponse } from '../types';
import logger from '../utils/logger.util';

/**
 * Health service for health check operations
 */
class HealthService {
  /**
   * Check service health
   * 
   * @returns Health check response
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      // Check database connection
      let databaseStatus: 'ok' | 'error' = 'ok';
      let databaseMessage = 'Connected to database';
      
      try {
        // Execute a simple query to check database connection
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        databaseStatus = 'error';
        databaseMessage = 'Database connection failed';
        logger.error('Health check database error:', { error });
      }

      // Calculate uptime
      const uptime = process.uptime();
      
      return {
        status: databaseStatus === 'ok' ? 'ok' : 'error',
        uptime,
        timestamp: new Date(),
        database: {
          status: databaseStatus,
          message: databaseMessage,
        },
      };
    } catch (error) {
      logger.error('Health check error:', { error });
      
      return {
        status: 'error',
        uptime: process.uptime(),
        timestamp: new Date(),
        database: {
          status: 'error',
          message: 'Health check encountered an error',
        },
      };
    }
  }
}

export default new HealthService();