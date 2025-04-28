import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../utils/valiation.util';
import { 
  changePasswordValidation, 
  createUserValidation, 
  getUsersValidation, 
  updateUserValidation 
} from '../dtos/user.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { adminOnly, anyUser } from '../middlewares/role.middleware';

const router = Router();

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user (admin only)
 * @access  Private/Admin
 */
router.post(
  '/', 
  authenticate, 
  adminOnly, 
  validate(createUserValidation), 
  userController.createUser
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filtering and pagination
 * @access  Private/Admin
 */
router.get(
  '/', 
  authenticate, 
  adminOnly, 
  validate(getUsersValidation), 
  userController.getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  '/:id', 
  authenticate, 
  anyUser, 
  userController.getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (users can update their own profile, admins can update any)
 */
router.put(
  '/:id', 
  authenticate, 
  anyUser, 
  validate(updateUserValidation), 
  userController.updateUser
);

/**
 * @route   PATCH /api/v1/users/:id/change-password
 * @desc    Change user password
 * @access  Private (users can change their own password, admins can change any)
 */
router.patch(
  '/:id/change-password', 
  authenticate, 
  anyUser, 
  validate(changePasswordValidation), 
  userController.changePassword
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete(
  '/:id', 
  authenticate, 
  adminOnly, 
  userController.deleteUser
);

export default router;