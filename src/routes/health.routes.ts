import { Router } from 'express';
import healthController from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Get health status of the service
 * @access  Public
 */
router.get('/', healthController.getHealth);

export default router;