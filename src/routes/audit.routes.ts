import { Router } from 'express';
import auditController from '../controllers/audit.controller';
import { validate } from '../utils/valiation.util';
import { getAuditLogsValidation } from '../dtos/audit.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/role.middleware';

const router = Router();

/**
 * @route   GET /api/v1/audit-logs
 * @desc    Get all audit logs with filtering and pagination
 * @access  Private/Admin
 */
router.get(
  '/', 
  authenticate, 
  adminOnly, 
  validate(getAuditLogsValidation), 
  auditController.getAuditLogs
);

/**
 * @route   GET /api/v1/audit-logs/:id
 * @desc    Get audit log by ID
 * @access  Private/Admin
 */
router.get(
  '/:id', 
  authenticate, 
  adminOnly, 
  auditController.getAuditLogById
);

export default router;