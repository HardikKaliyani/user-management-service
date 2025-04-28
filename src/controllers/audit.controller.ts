import { Request, Response } from 'express';
import auditService from '../services/audit.service';
import logger from '../utils/logger.util';

/**
 * Audit controller for audit log endpoints
 */
class AuditController {
  /**
   * Get all audit logs with filtering and pagination
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const filter = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        userId: req.query.userId as string | undefined,
        endpoint: req.query.endpoint as string | undefined,
        method: req.query.method as string | undefined,
        responseStatus: req.query.responseStatus ? parseInt(req.query.responseStatus as string, 10) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      };

      const auditLogs = await auditService.getAuditLogs(filter);
      res.status(200).json({
        status: 'success',
        message: 'Audit logs retrieved successfully',
        data: auditLogs,
      });
    } catch (error) {
      logger.error('Get audit logs error:', { error });
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while retrieving audit logs',
      });
    }
  }

  /**
   * Get audit log by ID
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const auditLog = await auditService.getAuditLogById(id);
      res.status(200).json({
        status: 'success',
        message: 'Audit log retrieved successfully',
        data: auditLog,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Audit log not found') {
        res.status(404).json({
          status: 'error',
          message: 'Audit log not found',
        });
      } else {
        logger.error('Get audit log error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while retrieving audit log',
        });
      }
    }
  }
}

export default new AuditController();