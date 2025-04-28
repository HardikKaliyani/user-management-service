import { Request, Response } from 'express';
import userService from '../services/user.service';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger.util';
import { Role } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware';

/**
 * User controller for user management endpoints
 */
class UserController {
  /**
   * Create a new user (admin only)
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await userService.createUser(req.body);
      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      } else {
        logger.error('User creation error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred during user creation',
        });
      }
    }
  }

  /**
   * Get user by ID
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      res.status(200).json({
        status: 'success',
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      } else {
        logger.error('Get user error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while retrieving user',
        });
      }
    }
  }

  /**
   * Update user
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      
      // Check if user is updating their own profile or is an admin
      if (req.user?.id !== userId && req.user?.role !== Role.ADMIN) {
        throw new ApiError(403, 'You are not authorized to update this user');
      }

      // Non-admin users can't change roles
      if (req.user?.role !== Role.ADMIN && req.body.role) {
        delete req.body.role;
      }

      const updatedUser = await userService.updateUser(userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      } else {
        logger.error('Update user error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while updating user',
        });
      }
    }
  }

  /**
   * Change user password
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      
      // Users can only change their own password (except admins)
      if (req.user?.id !== userId && req.user?.role !== Role.ADMIN) {
        throw new ApiError(403, 'You are not authorized to change this user\'s password');
      }

      await userService.changePassword(userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      } else {
        logger.error('Password change error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while changing password',
        });
      }
    }
  }

/**
   * Delete user
   * 
   * @param req - Express request
   * @param res - Express response
   */
async deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.id;
    await userService.softDeleteUser(userId);
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    } else {
      logger.error('Delete user error:', { error });
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while deleting user',
      });
    }
  }
}

  /**
   * Get all users with filtering and pagination
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const filter = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        role: req.query.role as Role | undefined,
        email: req.query.email as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        includeDeleted: req.query.includeDeleted === 'true',
      };

      const users = await userService.getUsers(filter);
      res.status(200).json({
        status: 'success',
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      logger.error('Get users error:', { error });
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while retrieving users',
      });
    }
  }
}

export default new UserController();