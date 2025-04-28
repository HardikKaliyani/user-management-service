import { query } from 'express-validator';

// Audit log listing DTO validation
export const getAuditLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100')
    .toInt(),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  query('endpoint')
    .optional()
    .isString()
    .withMessage('Endpoint must be a string'),
  query('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .withMessage('Method must be a valid HTTP method'),
  query('responseStatus')
    .optional()
    .isInt()
    .withMessage('Response status must be an integer')
    .toInt(),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('sortBy')
    .optional()
    .isIn(['timestamp', 'endpoint', 'method', 'responseStatus'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];

// Interfaces for request and response objects
export interface AuditLogResponseDto {
  id: string;
  userId: string | null;
  userName: string | null;
  endpoint: string;
  method: string;
  requestBody: any;
  responseStatus: number;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

export interface AuditLogListDto {
  auditLogs: AuditLogResponseDto[];
  totalLogs: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogFilterDto {
  page?: number;
  limit?: number;
  userId?: string;
  endpoint?: string;
  method?: string;
  responseStatus?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAuditLogDto {
  userId?: string;
  endpoint: string;
  method: string;
  requestBody?: any;
  responseStatus: number;
  ipAddress?: string;
  userAgent?: string;
}