import { AuditLog } from '@prisma/client';
import auditRepository from '../repositories/audit.repository';
import { AuditLogFilterDto, AuditLogListDto, AuditLogResponseDto, CreateAuditLogDto } from '../dtos/audit.dto';
import { ApiError } from '../middlewares/error.middleware';
import logger from '../utils/logger.util';

/**
 * Audit service for audit log operations
 */
class AuditService {
  /**
   * Create a new audit log entry
   * 
   * @param logData - Audit log data
   * @returns Created audit log
   */
  async createAuditLog(logData: CreateAuditLogDto): Promise<AuditLog> {
    try {
      return await auditRepository.create(logData);
    } catch (error) {
      logger.error('Audit log creation failed:', { error, logData });
      throw error;
    }
  }

  /**
   * Get all audit logs with filtering and pagination
   * 
   * @param filter - Filter options
   * @returns List of audit logs
   */
  async getAuditLogs(filter: AuditLogFilterDto): Promise<AuditLogListDto> {
    try {
      const { auditLogs, totalLogs } = await auditRepository.findAll(filter);

      // Calculate total pages
      const limit = filter.limit || 10;
      const totalPages = Math.ceil(totalLogs / limit);

      return {
        auditLogs: auditLogs.map(log => this.mapAuditLogToResponse(log)),
        totalLogs,
        page: filter.page || 1,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Fetching audit logs failed:', { error, filter });
      throw error;
    }
  }

  /**
   * Get an audit log by ID
   * 
   * @param id - Audit log ID
   * @returns Audit log response
   */
  async getAuditLogById(id: string): Promise<AuditLogResponseDto> {
    try {
      const auditLog = await auditRepository.findById(id);
      if (!auditLog) {
        throw new ApiError(404, 'Audit log not found');
      }

      return this.mapAuditLogToResponse(auditLog);
    } catch (error) {
      logger.error('Fetching audit log failed:', { error, id });
      throw error;
    }
  }

  /**
   * Map audit log entity to response DTO
   * 
   * @param auditLog - Audit log entity
   * @returns Audit log response
   */
  private mapAuditLogToResponse(auditLog: any): AuditLogResponseDto {
    return {
      id: auditLog.id,
      userId: auditLog.userId,
      userName: auditLog.user?.name || null,
      endpoint: auditLog.endpoint,
      method: auditLog.method,
      requestBody: auditLog.requestBody,
      responseStatus: auditLog.responseStatus,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      timestamp: auditLog.timestamp,
    };
  }
}

export default new AuditService();