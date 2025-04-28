import { AuditLog, Prisma } from '@prisma/client';
import prisma from '../config/database.config';
import { AuditLogFilterDto, CreateAuditLogDto } from '../dtos/audit.dto';

/**
 * Audit log repository for database operations
 */
class AuditRepository {
  /**
   * Create a new audit log entry
   * 
   * @param logData - Audit log data to create
   * @returns Created audit log
   */
  async create(logData: CreateAuditLogDto): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: logData,
    });
  }

  /**
   * Find audit logs with filtering, pagination, and sorting
   * 
   * @param filter - Filter and pagination options
   * @returns Audit logs and count
   */
  async findAll(filter: AuditLogFilterDto): Promise<{
    auditLogs: (AuditLog & { user: { name: string } | null })[];
    totalLogs: number;
  }> {
    const {
      page = 1,
      limit = 10,
      userId,
      endpoint,
      method,
      responseStatus,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = filter;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Prepare filter conditions
    const where: Prisma.AuditLogWhereInput = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (endpoint) {
      where.endpoint = {
        contains: endpoint,
        mode: 'insensitive',
      };
    }
    
    if (method) {
      where.method = method;
    }
    
    if (responseStatus) {
      where.responseStatus = responseStatus;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    // Prepare sort order
    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute query with user information
    const [auditLogs, totalLogs] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { auditLogs, totalLogs };
  }

  /**
   * Get audit log by ID
   * 
   * @param id - Audit log ID
   * @returns Audit log or null if not found
   */
  async findById(id: string): Promise<AuditLog | null> {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}

export default new AuditRepository();